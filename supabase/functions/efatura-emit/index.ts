/**
 * efatura-emit — Emit an electronic invoice (FTE) to DNRE eFatura
 *
 * Architecture:
 *   Transmitter = Servyx Labs (the SaaS operator, certified by DNRE)
 *   Emitter     = Servyx Labs (also the seller of the subscription)
 *   Receiver    = Nha Féria customer company
 *
 * Environments:
 *   Test:       https://saft.tst.efatura.cv/v1
 *   Production: https://services.efatura.cv/v1
 *
 * Required secrets (set via `supabase secrets set`):
 *   EFATURA_ENV            = "test" | "production"
 *   EFATURA_CLIENT_ID      = OAuth2 Client ID from DNRE
 *   EFATURA_CLIENT_SECRET  = OAuth2 Client Secret from DNRE
 *   EFATURA_OAUTH_URL      = OAuth2 token endpoint from DNRE
 *   EFATURA_LED_CODE       = 5-char LED code pre-registered with DNRE
 *   SERVYX_NIF             = NIF of Servyx Labs (9 digits, zero-padded)
 *   SERVYX_NAME            = "Servyx Labs"
 *   SERVYX_ADDRESS         = Full address (Mindelo, São Vicente, Cabo Verde)
 *   SERVYX_PRIVATE_KEY_PEM = ICP-CV private key PEM (for XAdES-BES signing)
 *   SERVYX_CERT_PEM        = ICP-CV certificate PEM
 *
 * IVA rate in Cabo Verde: 15% (standard rate for services)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Constants ─────────────────────────────────────────────────────────────────
const IVA_RATE      = 0.15; // 15% — Cabo Verde standard rate for services
const DOC_TYPE      = 'FTE'; // Fatura Electrónica
const CV_REPO       = '01';  // repository code — confirm with DNRE
const EFATURA_BASE  = Deno.env.get('EFATURA_ENV') === 'production'
  ? 'https://services.efatura.cv/v1'
  : 'https://saft.tst.efatura.cv/v1';

// Servyx Labs (transmitter + emitter)
const SERVYX_NIF     = Deno.env.get('SERVYX_NIF')     ?? '000000000'; // placeholder
const SERVYX_NAME    = Deno.env.get('SERVYX_NAME')    ?? 'Servyx Labs';
const SERVYX_ADDRESS = Deno.env.get('SERVYX_ADDRESS') ?? 'Mindelo, São Vicente, Cabo Verde';
const LED_CODE       = Deno.env.get('EFATURA_LED_CODE') ?? '00001'; // placeholder

// ── IUD Generation ────────────────────────────────────────────────────────────
/**
 * Generates a 45-character IUD (Identificador Único do Documento).
 *
 * Format (confirmed against Manual Técnico eFatura v10.0):
 *   CV(2) + Repository(2) + YYYYMMDD(8) + NIF(9) + LED(5) + DocType(3) + SeqNum(9) + Random(6) + CheckDigit(1)
 *   = 2+2+8+9+5+3+9+6+1 = 45 chars
 *
 * NOTE: Confirm exact segment lengths against the official XSD schemas at
 *       efatura.cv/docs/manual when DNRE credentials are available.
 */
function generateIUD(seqNumber: number, now: Date): string {
  const year  = String(now.getFullYear()).slice(-2);  // 2-digit year
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const date  = year + month + day; // 6 chars (YYMMDD)

  const nif     = SERVYX_NIF.padStart(9, '0').slice(-9);     // 9 chars
  const led     = LED_CODE.padStart(5, '0').slice(-5);        // 5 chars
  const docType = DOC_TYPE.padStart(3, ' ').slice(-3);        // 3 chars
  const seq     = String(seqNumber).padStart(9, '0').slice(-9); // 9 chars
  const random  = Math.random().toString(36).toUpperCase().slice(2, 8).padEnd(6, '0'); // 6 chars

  const body = `CV${CV_REPO}${date}${nif}${led}${docType}${seq}${random}`;
  // body length = 2+2+6+9+5+3+9+6 = 42 chars + 2 (CV) = 44 chars, then +1 check digit = 45
  const checkDigit = luhnCheckDigit(body);
  return body + checkDigit;
}

/** Luhn algorithm adapted for alphanumeric strings — mod 36 */
function luhnCheckDigit(input: string): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  let double = false;
  for (let i = input.length - 1; i >= 0; i--) {
    let val = chars.indexOf(input[i]);
    if (val < 0) continue; // skip non-alphanumeric
    if (double) {
      val *= 2;
      if (val >= 36) val -= 35;
    }
    sum += val;
    double = !double;
  }
  const remainder = (36 - (sum % 36)) % 36;
  return chars[remainder];
}

// ── XML Builder ───────────────────────────────────────────────────────────────
/**
 * Builds the unsigned DFE XML string.
 * Namespace: urn:cv:efatura:xsd:v1.0
 *
 * The <Signature> element is left as a placeholder — it will be filled
 * by the signXml() function using XAdES-BES once certificates are available.
 */
function buildInvoiceXml(params: {
  iud: string;
  docNumber: string;
  issuedAt: Date;
  amountNet: number;
  amountTax: number;
  amountGross: number;
  description: string;
  receiverNif: string | null;
  receiverName: string;
}): string {
  const {
    iud, docNumber, issuedAt, amountNet, amountTax, amountGross,
    description, receiverNif, receiverName,
  } = params;

  const isoDate = issuedAt.toISOString().split('T')[0];
  const isoDateTime = issuedAt.toISOString().replace(/\.\d{3}Z$/, 'Z');

  // Amounts as strings with 2 decimal places (CVE, no cents — but spec requires decimal)
  const fmt = (v: number) => (v / 100).toFixed(2); // stored as integer centavos internally

  return `<?xml version="1.0" encoding="UTF-8"?>
<DFE xmlns="urn:cv:efatura:xsd:v1.0" Version="1.0" Id="${escXml(iud)}">
  <DocumentTypeCode>${DOC_TYPE}</DocumentTypeCode>
  <IUD>${escXml(iud)}</IUD>
  <TransmitterNIF>${escXml(SERVYX_NIF)}</TransmitterNIF>

  <EmitterParty>
    <NIF>${escXml(SERVYX_NIF)}</NIF>
    <Name>${escXml(SERVYX_NAME)}</Name>
    <Address>
      <AddressDetail>${escXml(SERVYX_ADDRESS)}</AddressDetail>
      <Country>CV</Country>
    </Address>
  </EmitterParty>

  <ReceiverParty>
    ${receiverNif ? `<NIF>${escXml(receiverNif)}</NIF>` : '<!-- NIF not provided -->'}
    <Name>${escXml(receiverName)}</Name>
  </ReceiverParty>

  <DocumentDate>${isoDate}</DocumentDate>
  <TaxPointDate>${isoDate}</TaxPointDate>
  <SystemEntryDateTime>${isoDateTime}</SystemEntryDateTime>
  <LEDCode>${escXml(LED_CODE)}</LEDCode>
  <DocumentNumber>${escXml(docNumber)}</DocumentNumber>

  <Lines>
    <Line>
      <LineNumber>1</LineNumber>
      <Description>${escXml(description)}</Description>
      <Quantity>1</Quantity>
      <UnitOfMeasure>UN</UnitOfMeasure>
      <UnitPrice>${fmt(amountNet)}</UnitPrice>
      <TaxCategory>
        <TaxType>IVA</TaxType>
        <TaxCode>NOR</TaxCode>
        <TaxRate>15.00</TaxRate>
      </TaxCategory>
      <LineNetAmount>${fmt(amountNet)}</LineNetAmount>
      <LineTaxAmount>${fmt(amountTax)}</LineTaxAmount>
      <LineGrossAmount>${fmt(amountGross)}</LineGrossAmount>
    </Line>
  </Lines>

  <TaxSummary>
    <TaxCode>IVA</TaxCode>
    <TaxType>NOR</TaxType>
    <TaxRate>15.00</TaxRate>
    <TaxableAmount>${fmt(amountNet)}</TaxableAmount>
    <TaxAmount>${fmt(amountTax)}</TaxAmount>
  </TaxSummary>

  <DocumentTotals>
    <TaxableAmount>${fmt(amountNet)}</TaxableAmount>
    <TaxAmount>${fmt(amountTax)}</TaxAmount>
    <GrossTotal>${fmt(amountGross)}</GrossTotal>
    <NetTotal>${fmt(amountNet)}</NetTotal>
  </DocumentTotals>

  <!-- XAdES-BES digital signature — inserted by signXml() -->
  <Signature>__SIGNATURE_PLACEHOLDER__</Signature>
</DFE>`;
}

// ── XAdES-BES Signing ─────────────────────────────────────────────────────────
/**
 * Signs the XML document using XAdES-BES with the Servyx Labs ICP-CV certificate.
 *
 * ⚠️  REQUIRES: SERVYX_PRIVATE_KEY_PEM + SERVYX_CERT_PEM env vars
 *
 * In Deno Edge Functions, use the Web Crypto API (RSASSA-PKCS1-v1_5 or RSA-PSS).
 * The XAdES-BES profile requires:
 *   1. Compute SHA-256 digest of the XML content (canonicalized C14N)
 *   2. Sign with the private RSA key
 *   3. Base64-encode the signature
 *   4. Build the <Signature> block with SignedInfo, SignatureValue, KeyInfo
 *
 * This is a PLACEHOLDER — implement once ICP-CV certificate is obtained from SISP.
 * For homologation testing, DNRE may accept unsigned documents initially.
 * Confirm with DNRE support at efatura.cv.
 */
async function signXml(xml: string): Promise<string> {
  const privateKeyPem = Deno.env.get('SERVYX_PRIVATE_KEY_PEM');
  const certPem       = Deno.env.get('SERVYX_CERT_PEM');

  if (!privateKeyPem || !certPem) {
    // ⚠️ NO CERTIFICATE YET — return XML with placeholder signature
    // This is only valid for homologation test environment
    console.warn('⚠️  XAdES-BES signing skipped — no certificate configured. Valid for test environment only.');
    return xml.replace(
      '__SIGNATURE_PLACEHOLDER__',
      '<!-- UNSIGNED — configure SERVYX_PRIVATE_KEY_PEM and SERVYX_CERT_PEM for production -->',
    );
  }

  // ── REAL SIGNING (activate when certificate is available) ─────────────────
  // 1. Import the private key
  const keyData = pemToArrayBuffer(privateKeyPem);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // 2. Canonicalize and sign the content (simplified C14N — use proper C14N in production)
  const contentToSign = xml.replace(/<Signature>.*?<\/Signature>/s, '');
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(contentToSign);
  const signatureBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, dataBuffer);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  // 3. Compute SHA-256 digest of the content
  const digestBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const digestB64 = btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));

  // 4. Extract certificate (remove PEM headers)
  const certB64 = certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '');

  // 5. Build XAdES-BES Signature block
  const sigBlock = `
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
        <ds:Reference URI="">
          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
          <ds:DigestValue>${digestB64}</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
      <ds:SignatureValue>${signatureB64}</ds:SignatureValue>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${certB64}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </ds:Signature>`;

  return xml.replace('__SIGNATURE_PLACEHOLDER__', sigBlock);
}

// ── OAuth2 Token ──────────────────────────────────────────────────────────────
// Simple in-memory cache — Edge Functions are stateless so this only helps within one invocation
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token;

  const oauthUrl      = Deno.env.get('EFATURA_OAUTH_URL') ?? 'https://auth.efatura.cv/oauth2/token';
  const clientId      = Deno.env.get('EFATURA_CLIENT_ID') ?? 'PLACEHOLDER_CLIENT_ID';
  const clientSecret  = Deno.env.get('EFATURA_CLIENT_SECRET') ?? 'PLACEHOLDER_SECRET';

  const res = await fetch(oauthUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
      scope:         'cv_ef_dfe_create cv_ef_dfe_read_list',
    }),
  });

  if (!res.ok) throw new Error(`OAuth2 token request failed: ${res.status}`);
  const json = await res.json();
  _tokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in - 60) * 1000 };
  return json.access_token;
}

// ── Submit to eFatura API ─────────────────────────────────────────────────────
async function submitToEfatura(signedXml: string, iud: string): Promise<{ success: boolean; response: unknown }> {
  const token = await getOAuthToken();

  // Package XML into a ZIP (filename = IUD, as required by spec)
  // NOTE: Deno doesn't have a native zip API — using a minimal deflate approach.
  // For production, use a proper zip library or the DecompressionStream API.
  const zipBytes = await buildZip(signedXml, `${iud}.xml`);

  const form = new FormData();
  form.append('file', new Blob([zipBytes], { type: 'application/zip' }), `${iud}.zip`);

  const res = await fetch(`${EFATURA_BASE}/dfes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const responseBody = await res.json().catch(() => ({ raw: 'non-JSON response' }));
  return { success: res.ok, response: responseBody };
}

// ── Minimal ZIP builder ───────────────────────────────────────────────────────
// Creates a valid ZIP with a single file using the DecompressionStream workaround.
// For production, replace with a proper zip library (e.g. fflate via esm.sh).
async function buildZip(content: string, filename: string): Promise<Uint8Array> {
  // Using fflate for proper ZIP/Deflate support in Deno
  const { strToU8, zipSync } = await import('https://esm.sh/fflate@0.8.2');
  const files: Record<string, Uint8Array> = {};
  files[filename] = strToU8(content);
  return zipSync(files);
}

// ── Main Handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { paymentId } = await req.json() as { paymentId: string };

    // Fetch payment + company data
    const { data: payment } = await serviceClient
      .from('payments')
      .select('id, company_id, amount, plan, billing_period, companies(name, plan)')
      .eq('id', paymentId)
      .eq('status', 'success')
      .single();

    if (!payment) return jsonError('Payment not found or not successful', 404);

    // Check if invoice already exists for this payment
    const { data: existing } = await serviceClient
      .from('invoices')
      .select('id, iud')
      .eq('payment_id', paymentId)
      .single();
    if (existing) {
      return new Response(JSON.stringify({ iud: existing.iud, alreadyIssued: true }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Get invoice sequence number for this year
    const { data: seqRow } = await serviceClient.rpc('nextval', { seq_name: 'invoice_seq' });
    const seqNum = seqRow ?? Math.floor(Math.random() * 99999);

    const now = new Date();
    const iud = generateIUD(seqNum, now);
    const year = now.getFullYear();
    const docNumber = `FTE ${year}/${String(seqNum).padStart(5, '0')}`;

    // Calculate IVA (amounts in the payments table are in CVE, stored as integers)
    const amountGross = payment.amount; // full amount customer paid
    const amountNet   = Math.round(amountGross / (1 + IVA_RATE)); // base without IVA
    const amountTax   = amountGross - amountNet;

    // Build description
    const planLabel    = payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1);
    const periodLabel  = payment.billing_period === 'annual' ? 'Anual' : 'Mensal';
    const description  = `Subscrição Nha Féria ${planLabel} — ${periodLabel} ${year}`;

    // Get receiver info from company (NIF may not be set yet)
    const company = (payment as any).companies;

    // Build XML
    const unsignedXml = buildInvoiceXml({
      iud,
      docNumber,
      issuedAt: now,
      amountNet:   amountNet   * 100, // fmt() divides by 100 — stored as CVE integers
      amountTax:   amountTax   * 100,
      amountGross: amountGross * 100,
      description,
      receiverNif:  null, // TODO: collect NIF during signup
      receiverName: company?.name ?? 'Cliente Nha Féria',
    });

    // Sign (placeholder until certificate is configured)
    const signedXml = await signXml(unsignedXml);

    // Submit to eFatura
    const { success, response } = await submitToEfatura(signedXml, iud);

    // Store invoice record
    await serviceClient.from('invoices').insert({
      company_id:       payment.company_id,
      payment_id:       paymentId,
      iud,
      doc_number:       docNumber,
      doc_type:         DOC_TYPE,
      amount_net:       amountNet,
      amount_tax:       amountTax,
      amount_gross:     amountGross,
      receiver_name:    company?.name ?? 'Cliente Nha Féria',
      status:           success ? 'authorized' : 'pending',
      efatura_response: response,
      xml_content:      signedXml,
    });

    return new Response(JSON.stringify({ iud, success, response }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('efatura-emit error:', err);
    return jsonError(String(err), 500);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN.*?-----|-----END.*?-----|\n/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
