import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Scissors, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Store,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { AdminUser } from '../types';

export const AdminManagement: React.FC = () => {
  const { 
    admins, 
    addAdmin, 
    deleteAdmin, 
    currentAdmin, 
    isSuperUser,
    barbers, 
    barbershops,
    activeShopId,
    setActiveView,
    profile 
  } = useBarber();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager'>('admin');
  const [targetShopId, setTargetShopId] = useState(activeShopId);
  const [specialty, setSpecialty] = useState('Especialista em Cortes Masculinos & Barba');
  const [createBarberProfile, setCreateBarberProfile] = useState(true);

  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Requisito estrito: ACESSAR A área DO ADM somente o superuser
  if (!isSuperUser) {
    return (
      <div className="p-8 sm:p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg mx-auto my-12 space-y-4 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Acesso Restrito ao Superusuário</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Somente o <strong>Superusuário</strong> possui permissão para acessar a área de administradores e cadastrar novos administradores no sistema.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Voltar ao Meu Painel
        </button>
      </div>
    );
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = addAdmin({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      targetShopId,
      specialty: specialty.trim(),
      createBarberProfile
    });

    if (res.success) {
      setStatusMsg({ text: 'Novo administrador cadastrado com sucesso pelo Superusuário!', isError: false });
      setName('');
      setUsername('');
      setPassword('');
      setShowAddForm(false);
    } else {
      setStatusMsg({ text: res.message, isError: true });
    }
  };

  const handleDelete = (adm: AdminUser) => {
    if (adm.id === currentAdmin?.id) {
      alert('Você não pode excluir sua própria conta atualmente conectada.');
      return;
    }
    if (adm.role === 'superuser' || adm.username.toLowerCase() === 'superuser') {
      alert('A conta do Superusuário não pode ser removida.');
      return;
    }
    if (confirm(`Tem certeza que deseja revogar o acesso do administrador "${adm.name}" (@${adm.username})?`)) {
      deleteAdmin(adm.id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Administradores</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Área Exclusiva Superusuário
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1 pl-11">
            Cadastre novos administradores e gerentes para as filiais da rede. Regularmente, administradores só podem cadastrar barbeiros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('app_barbearia')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl border border-neutral-700 transition-all"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Ver AppBarbearia</span>
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Administrador</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs ${
          statusMsg.isError
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
        }`}>
          {statusMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <form onSubmit={handleCreateAdmin} className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Cadastrar Novo Administrador</h3>
              <p className="text-[11px] text-neutral-400">Somente o Superusuário pode criar novas contas de administradores</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Matheus Oliveira"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Filial / Unidade Alocada *</label>
              <select
                value={targetShopId}
                onChange={(e) => setTargetShopId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {barbershops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name} {shop.id === activeShopId ? '(Atual)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Cargo / Nível</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="admin">Administrador (Cadastra barbeiros na filial)</option>
                <option value="manager">Gerente Operacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Usuário / Login *</label>
              <input
                type="text"
                required
                placeholder="Ex: matheus"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Senha de Acesso *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createBarberProfile}
                onChange={(e) => setCreateBarberProfile(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 border-neutral-700 bg-neutral-900"
              />
              <span className="text-xs font-semibold text-neutral-200">
                Criar automaticamente perfil de barbeiro na grade para este administrador
              </span>
            </label>

            {createBarberProfile && (
              <div className="pl-6 pt-1">
                <label className="block text-[11px] text-neutral-400 mb-1">Especialidade do Barbeiro</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
            >
              Cadastrar Administrador
            </button>
          </div>
        </form>
      )}

      {/* Admin Users Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map(adm => {
          const isSuper = adm.role === 'superuser' || adm.username.toLowerCase() === 'superuser';
          const isMe = adm.id === currentAdmin?.id;
          const linkedBarber = barbers.find(b => b.id === adm.barberId);
          const shop = barbershops.find(s => s.id === adm.shopId);

          return (
            <div 
              key={adm.id}
              className={`p-5 rounded-3xl border transition-all shadow-md ${
                isSuper
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-amber-500/5'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    isSuper
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-950 border border-neutral-800 text-amber-400'
                  }`}>
                    {adm.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{adm.name}</h4>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                          Você
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">@{adm.username}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isSuper
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}>
                  {isSuper ? 'Superusuário' : (adm.role === 'admin' ? 'Administrador' : 'Gerente')}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between items-center">
                  <span>Filial Alocada:</span>
                  <span className="text-white font-medium truncate max-w-[150px]">
                    {shop ? shop.name : 'Todas / Geral'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Agenda Vinculada:</span>
                  <span className="text-white font-medium">
                    {linkedBarber ? linkedBarber.name : 'Nenhuma'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Permissões:</span>
                  <span className="text-amber-400/90 font-medium">
                    {isSuper ? 'Controle Total da Rede' : 'Cadastrar Barbeiros'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Criado em:</span>
                  <span>{new Date(adm.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {!isSuper && !isMe && (
                <div className="mt-4 pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => handleDelete(adm)}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Acesso</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
