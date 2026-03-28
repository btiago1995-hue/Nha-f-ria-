import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CV_SECTORS } from '../../lib/sectors';

const CompanySetupModal = ({ profile, onComplete }) => {
  const [step, setStep]         = useState('sector'); // 'sector' | 'name'
  const [sector, setSector]     = useState(null);
  const [name, setName]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sector) return;
    setSaving(true);
    setError('');
    try {
      const { error: err } = await supabase
        .from('companies')
        .update({ name: name.trim() || 'A Minha Empresa', sector })
        .eq('id', profile.company_id);
      if (err) throw err;
      onComplete();
    } catch (err) {
      setError('Erro ao guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-light px-8 py-7 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              🌴
            </div>
            <span className="font-display font-bold text-lg">Nha Féria</span>
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">Configurar a tua organização</h1>
          <p className="text-white/70 text-sm">
            Escolhe o setor de atividade para personalizar os departamentos da tua empresa.
          </p>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {['sector', 'name'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  step === s ? 'bg-accent text-primary' :
                  (step === 'name' && s === 'sector') ? 'bg-white/30 text-white' :
                  'bg-white/20 text-white/60'
                }`}>
                  {step === 'name' && s === 'sector' ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${step === s ? 'text-white' : 'text-white/50'}`}>
                  {s === 'sector' ? 'Setor' : 'Nome'}
                </span>
                {i < 1 && <div className="w-8 h-px bg-white/20" />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'sector' && (
              <motion.div
                key="sector"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-semibold text-text-muted mb-5">
                  Qual é o setor de atividade da tua empresa em Cabo Verde?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CV_SECTORS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSector(s.key)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        sector === s.key
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-bg'
                      }`}
                    >
                      {sector === s.key && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <span className="text-2xl">{s.icon}</span>
                      <span className={`text-[11px] font-bold leading-tight ${sector === s.key ? 'text-primary' : 'text-text'}`}>
                        {s.label}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {s.departments.slice(0, 3).map(d => (
                          <span key={d} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            {d}
                          </span>
                        ))}
                        {s.departments.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full">
                            +{s.departments.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    disabled={!sector}
                    onClick={() => setStep('name')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-light transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">{CV_SECTORS.find(s => s.key === sector)?.icon}</span>
                  <div>
                    <div className="text-xs text-text-muted font-medium">Setor selecionado</div>
                    <div className="text-sm font-bold text-primary">{CV_SECTORS.find(s => s.key === sector)?.label}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Departamentos: {CV_SECTORS.find(s => s.key === sector)?.departments.join(' · ')}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={13} /> Nome da Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Hotel Morabeza, Bantu Telecom…"
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                    <p className="text-[11px] text-text-muted">Podes alterar isto mais tarde nas Definições.</p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('sector')}
                      className="text-sm font-semibold text-text-muted hover:text-text transition-colors"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-light transition-all active:scale-95 disabled:opacity-60 shadow-sm"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {saving ? 'A guardar…' : 'Concluir Configuração'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanySetupModal;
