import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Scissors, 
  AlertCircle,
  Calendar,
  UserPlus,
  X,
  CheckCircle2
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export const AdminLoginScreen: React.FC = () => {
  const { loginAdmin, addAdmin, setActiveView, profile, barbers } = useBarber();

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('Barbeiro Profissional & Visagismo');
  const [regAutoCreateAgenda, setRegAutoCreateAgenda] = useState(true);
  const [regExistingBarberId, setRegExistingBarberId] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginAdmin(username, password);
      if (result.success) {
        setActiveView('dashboard');
      } else {
        setErrorMsg(result.message);
      }
      setIsLoading(false);
    }, 250);
  };

  const handleOpenRegister = () => {
    setRegName('');
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegSpecialty('Barbeiro Profissional & Visagismo');
    setRegAutoCreateAgenda(true);
    setRegExistingBarberId('');
    setRegError(null);
    setRegSuccess(null);
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Por favor, informe o nome completo.');
      return;
    }

    if (!regUsername.trim()) {
      setRegError('Por favor, informe o usuário de login.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não coincidem.');
      return;
    }

    const res = addAdmin({
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      role: 'admin',
      createBarberProfile: regAutoCreateAgenda,
      barberId: !regAutoCreateAgenda && regExistingBarberId ? regExistingBarberId : undefined,
      specialty: regSpecialty.trim()
    });

    if (res.success) {
      setRegSuccess('Administrador cadastrado com sucesso! Entrando...');
      // Automatically log in the newly registered admin
      setTimeout(() => {
        const loginRes = loginAdmin(regUsername.trim().toLowerCase(), regPassword.trim());
        if (loginRes.success) {
          setShowRegisterModal(false);
          setActiveView('dashboard');
        } else {
          // Pre-fill fields for manual login
          setUsername(regUsername.trim().toLowerCase());
          setPassword(regPassword.trim());
          setShowRegisterModal(false);
        }
      }, 700);
    } else {
      setRegError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="text-center relative z-10 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Área do Administrador
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Acesso exclusivo para gestão de agendamentos, equipe e relatórios de <span className="text-neutral-200 font-semibold">{profile.name}</span>.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Usuário / Login
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: igor"
                autoComplete="username"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Autenticando...' : 'Acessar Painel ADM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register New Admin Action */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 space-y-3">
          <button
            type="button"
            onClick={handleOpenRegister}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-amber-400 hover:text-amber-300 font-bold text-xs border border-neutral-700/80 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Administrador</span>
          </button>

          {/* Back to Client Portal Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setActiveView('client')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Voltar ao Portal de Agendamento do Cliente</span>
            </button>
          </div>
        </div>

      </div>

      {/* Registration Modal for New Admin */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Cadastrar Novo Administrador
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Crie um novo acesso administrativo com agenda individualizada.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Usuário de Login (Username)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 text-xs font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="carlos"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                    Confirmar Senha
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Agenda Setup Section */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Agenda Própria & Separada</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regAutoCreateAgenda}
                      onChange={(e) => setRegAutoCreateAgenda(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Criar nova agenda</span>
                  </label>
                </div>

                {regAutoCreateAgenda ? (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Especialidade no Perfil do Barbeiro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Barbeiro Profissional & Visagismo"
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Uma agenda exclusiva será criada para este profissional, permitindo que gerencie seus agendamentos separadamente.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Vincular a barbeiro já existente:
                    </label>
                    <select
                      value={regExistingBarberId}
                      onChange={(e) => setRegExistingBarberId(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Nenhum (Administrador geral sem agenda)</option>
                      {barbers.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar e Entrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

