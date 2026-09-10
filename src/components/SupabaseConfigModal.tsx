import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Code,
  CheckCircle2
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { SUPABASE_SQL_SCHEMA, testSupabaseConnection } from '../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { supabaseConfig, updateSupabaseConfig, syncWithSupabase } = useBarber();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlTab, setShowSqlTab] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage(null);

    const testResult = await testSupabaseConnection(url.trim(), anonKey.trim());
    if (testResult.success) {
      await updateSupabaseConfig(url.trim(), anonKey.trim());
      setStatusMessage({ type: 'success', text: testResult.message });
    } else {
      setStatusMessage({ type: 'error', text: testResult.message });
    }
    setTesting(false);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    const result = await syncWithSupabase();
    setStatusMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setSyncing(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Database className="w-5 h-5" />
            <h3 className="font-extrabold text-white text-base">Banco de Dados Supabase</h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              supabaseConfig.connected
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              {supabaseConfig.connected ? 'Ativo & Sincronizado' : 'Modo Offline / Local'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Explanation Info */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Armazenamento Seguro em Nuvem com Supabase (PostgreSQL)
            </p>
            <p className="text-neutral-400 leading-relaxed">
              O aplicativo salva tudo de forma instantânea localmente e sincroniza em tempo real com seu banco de dados Supabase na nuvem. Agendamentos, recibos digitais e catálogo ficam persistidos com total segurança.
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Project URL do Supabase (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://seuprojeto.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Anon Public Key do Supabase (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={testing || !url || !anonKey}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Salvar & Testar Conexão</span>
                  </>
                )}
              </button>

              {supabaseConfig.connected && (
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleManualSync}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Agora</span>
                </button>
              )}

              {supabaseConfig.lastSync && (
                <span className="text-[11px] text-neutral-500 ml-auto self-center">
                  Última sincronização: {supabaseConfig.lastSync}
                </span>
              )}
            </div>
          </form>

          {/* SQL Script Generator */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-amber-400" />
                  <span>Script SQL de Criação das Tabelas no Supabase</span>
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Copie e execute no "SQL Editor" do painel Supabase para criar as 5 tabelas em 1 clique.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold border border-neutral-700 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-[11px] text-neutral-300 font-mono overflow-x-auto max-h-48 scrollbar-thin">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
