import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  Check, 
  X, 
  AlertTriangle, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2,
  CalendarCheck,
  Scissors,
  Calendar
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { AdminUser } from '../types';

export const AdminManagement: React.FC = () => {
  const { 
    admins, 
    currentAdmin, 
    barbers,
    addAdmin, 
    deleteAdmin, 
    updateAdminPassword,
    updateAdminBarberLink,
    setActiveView
  } = useBarber();

  // Create Admin Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager'>('admin');
  const [autoCreateAgenda, setAutoCreateAgenda] = useState(true);
  const [agendaSpecialty, setAgendaSpecialty] = useState('Barbeiro Profissional & Visagismo');
  const [selectedExistingBarberId, setSelectedExistingBarberId] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Change Password Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('admin');
    setAutoCreateAgenda(true);
    setAgendaSpecialty('Barbeiro Profissional & Visagismo');
    setSelectedExistingBarberId('');
    setCreateError(null);
    setCreateSuccess(null);
    setShowCreateModal(true);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setCreateError('Todos os campos são obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setCreateError('A confirmação de senha não confere.');
      return;
    }

    if (password.length < 4) {
      setCreateError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const res = addAdmin({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      role,
      createBarberProfile: autoCreateAgenda,
      barberId: !autoCreateAgenda && selectedExistingBarberId ? selectedExistingBarberId : undefined,
      specialty: agendaSpecialty
    });

    if (res.success) {
      setCreateSuccess(res.message);
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
      }, 1200);
    } else {
      setCreateError(res.message);
    }
  };

  const handleOpenChangePass = (adm: AdminUser) => {
    setEditingAdmin(adm);
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePassError(null);
    setChangePassSuccess(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setChangePassError(null);
    setChangePassSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setChangePassError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 4) {
      setChangePassError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const res = updateAdminPassword(editingAdmin.id, newPassword);
    if (res.success) {
      setChangePassSuccess(res.message);
      setTimeout(() => {
        setEditingAdmin(null);
        setChangePassSuccess(null);
      }, 1200);
    } else {
      setChangePassError(res.message);
    }
  };

  const confirmDelete = (id: string) => {
    deleteAdmin(id);
    setDeletingAdminId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Gestão de Administradores
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cadastre e gerencie os usuários com acesso total ao painel de agendamentos e faturamento.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Conectado como: <strong className="text-white">@{currentAdmin?.username}</strong></span>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo ADM</span>
          </button>
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {admins.map(adm => {
          const isCurrent = currentAdmin?.id === adm.id;
          const isDeletable = admins.length > 1;

          return (
            <div
              key={adm.id}
              className={`bg-neutral-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-amber-500/60 shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-inner">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">
                          {adm.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-amber-400 font-semibold">
                        @{adm.username}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    adm.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {adm.role === 'admin' ? 'Administrador' : 'Gerente'}
                  </span>
                </div>

                {/* Details */}
                <div className="py-3 border-y border-neutral-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-neutral-500" />
                      Cadastrado em:
                    </span>
                    <span className="text-neutral-200">
                      {new Date(adm.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      Último Acesso:
                    </span>
                    <span className="text-neutral-200">
                      {adm.lastLogin ? new Date(adm.lastLogin).toLocaleDateString('pt-BR') : 'Recente'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-neutral-500" />
                      Senha:
                    </span>
                    <span className="font-mono text-neutral-300">
                      ••••••••
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      Agenda Vinculada:
                    </span>
                    <select
                      value={adm.barberId || ''}
                      onChange={(e) => updateAdminBarberLink(adm.id, e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500 max-w-[160px] truncate"
                      title="Selecione o perfil de barbeiro cuja agenda pertence a este administrador"
                    >
                      <option value="">Nenhum (Sem agenda)</option>
                      {barbers.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('dashboard');
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition-colors"
                  title="Abrir a agenda deste administrador no painel"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenChangePass(adm)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alterar Senha</span>
                </button>

                {isDeletable && (
                  <button
                    type="button"
                    onClick={() => setDeletingAdminId(adm.id)}
                    className="p-2 rounded-xl bg-neutral-950 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors"
                    title="Excluir Administrador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in my-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-amber-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-extrabold text-white text-base">Cadastrar Novo Administrador</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Barbeiro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Login / Usuário (sem espaços) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 text-xs font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="carlos"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Este é o login usado para entrar no sistema.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nível de Permissão
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="admin">Administrador Geral (Acesso Total)</option>
                  <option value="manager">Gerente Operacional</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 4 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-500 hover:text-neutral-300"
                    >
                      {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Agenda Individual Setup */}
              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Agenda Própria & Separada</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCreateAgenda}
                      onChange={(e) => setAutoCreateAgenda(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Criar nova agenda</span>
                  </label>
                </div>

                {autoCreateAgenda ? (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Especialidade no Perfil do Barbeiro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Barbeiro Profissional, Visagismo & Degradê"
                      value={agendaSpecialty}
                      onChange={(e) => setAgendaSpecialty(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Uma agenda exclusiva será criada para {name || 'este profissional'}. Cada administrador gerencia seus horários separadamente.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Vincular a um barbeiro já existente:
                    </label>
                    <select
                      value={selectedExistingBarberId}
                      onChange={(e) => setSelectedExistingBarberId(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Nenhum (Administrador sem agenda)</option>
                      {barbers.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Salvar Novo ADM
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-extrabold text-white text-base">Alterar Senha</h3>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 mt-2">
              Defina uma nova senha para <strong className="text-white">@{editingAdmin.username}</strong> ({editingAdmin.name}).
            </p>

            {changePassError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{changePassError}</span>
              </div>
            )}

            {changePassSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{changePassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingAdminId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              Remover Administrador?
            </h3>
            <p className="text-xs text-neutral-400 mt-2">
              Este usuário perderá o acesso a todas as telas administrativas do sistema imediatamente.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingAdminId(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deletingAdminId)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
