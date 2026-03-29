import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-12 flex-1">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Voltar ao início
        </button>

        <h1 className="text-3xl font-bold text-text mb-2">Contacto</h1>
        <p className="text-text-muted mb-10">
          Estamos em São Vicente, Cabo Verde. Fala connosco por qualquer canal abaixo.
        </p>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          {/* Address */}
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Morada</div>
              <address className="not-italic text-sm text-text leading-relaxed">
                Servyx Labs, Lda.<br />
                Villa Nova, Rua 2 Lote 10<br />
                São Vicente, Cabo Verde
              </address>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Telefone</div>
              <a
                href="tel:+2385856003"
                className="text-sm text-text hover:text-primary transition-colors font-medium"
              >
                +238 585 6003
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">WhatsApp</div>
              <a
                href="https://wa.me/33611324897"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text hover:text-emerald-600 transition-colors font-medium"
              >
                +33 6 11 32 48 97
              </a>
            </div>
          </div>

          {/* Email suporte */}
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Suporte</div>
              <a
                href="mailto:suporte@nhaferia.cv"
                className="text-sm text-text hover:text-primary transition-colors font-medium"
              >
                suporte@nhaferia.cv
              </a>
            </div>
          </div>

          {/* Email vendas */}
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Vendas & Parcerias</div>
              <a
                href="mailto:vendas@nhaferia.cv"
                className="text-sm text-text hover:text-amber-600 transition-colors font-medium"
              >
                vendas@nhaferia.cv
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-text-muted py-6 border-t border-border">
        © {new Date().getFullYear()} Nha Féria by Servyx Labs, Lda. · São Vicente, Cabo Verde
      </footer>
    </div>
  );
};

export default ContactPage;
