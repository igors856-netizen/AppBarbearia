import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Check, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Users, 
  Scissors, 
  DollarSign, 
  ChevronRight, 
  Trash2, 
  ArrowRight,
  ExternalLink,
  Activity,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { formatCurrency } from '../utils/whatsapp';

export const AppBarbearia: React.FC = () => {
  const { 
    barbershops, 
    activeShopId, 
    switchBarbershop, 
    addBarbershop, 
    deleteBarbershop,
    appointments, 
    barbers, 
    admins,
    isSuperUser,
    setActiveView 
  } = useBarber();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopSlogan, setNewShopSlogan] = useState('Tradição e Estilo para Homens Modernos');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');

  if (!isSuperUser) {
    return (
      <div className="p-8 sm:p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg mx-auto my-12 space-y-4 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Store className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Área Exclusiva AppBarbearia</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Esta área é restrita ao <strong>Superusuário</strong> para monitoramento central de todas as unidades e filiais da rede.
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

  // Calculate global statistics
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const completedAppointmentsCount = appointments.filter(a => a.status === 'completed').length;

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    addBarbershop({
      name: newShopName.trim(),
      slogan: newShopSlogan.trim(),
      address: newShopAddress.trim() || 'Av. Principal, 1000 - Centro',
      phoneWhatsApp: newShopPhone.trim() || '5511999998888',
      openingTime: '09:00',
      closingTime: '20:00',
      slotIntervalMinutes: 30,
      daysOpen: [1, 2, 3, 4, 5, 6],
      primaryColor: '#f59e0b',
      accentColor: '#d97706',
      logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
      coverUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1200'
    });

    setNewShopName('');
    setNewShopAddress('');
    setNewShopPhone('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Banner Principal AppBarbearia */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">AppBarbearia</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Painel Central do Superusuário
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Monitoramento global da rede de barbearias, acesso a todas as unidades e gestão centralizada de filiais
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveView('admins')}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl border border-neutral-700 transition-all shadow-sm"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Gerenciar Administradores</span>
            </button>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Filial</span>
            </button>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-800/80">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Total de Unidades</span>
            </div>
            <p className="text-2xl font-black text-white">{barbershops.length}</p>
            <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">100% Operacionais</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Administradores</span>
            </div>
            <p className="text-2xl font-black text-white">{admins.length}</p>
            <span className="text-[10px] text-neutral-500 font-medium mt-0.5 block">Contas cadastradas</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span>Equipe de Barbeiros</span>
            </div>
            <p className="text-2xl font-black text-white">{barbers.length}</p>
            <span className="text-[10px] text-neutral-500 font-medium mt-0.5 block">Na unidade ativa</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Faturamento Total</span>
            </div>
            <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</p>
            <span className="text-[10px] text-neutral-500 font-medium mt-0.5 block">
              {completedAppointmentsCount} atendimentos concluídos
            </span>
          </div>
        </div>
      </div>

      {/* Form de Criação de Nova Filial */}
      {showCreateForm && (
        <form onSubmit={handleCreateShop} className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cadastrar Nova Filial / Unidade</h3>
                <p className="text-[11px] text-neutral-400">Permissão restrita e exclusiva para o Superusuário</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da Filial *</label>
              <input
                type="text"
                required
                placeholder="Ex: Barbearia Matriz Paulista"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Slogan ou Descrição</label>
              <input
                type="text"
                placeholder="Ex: Alto padrão em cortes e visagismo masculino"
                value={newShopSlogan}
                onChange={(e) => setNewShopSlogan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Endereço Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Av. Paulista, 1500 - Bela Vista, São Paulo"
                value={newShopAddress}
                onChange={(e) => setNewShopAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp da Unidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: 5511999998888"
                value={newShopPhone}
                onChange={(e) => setNewShopPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
            >
              Confirmar e Criar Filial
            </button>
          </div>
        </form>
      )}

      {/* Grid de Monitoramento de Unidades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Unidades Cadastradas para Monitoramento</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {barbershops.length} {barbershops.length === 1 ? 'unidade' : 'unidades'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 hidden sm:block">
            Clique em "Acessar esta Unidade" para entrar no contexto e operar a agenda local
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbershops.map((shop) => {
            const isActive = shop.id === activeShopId;
            const shopAdmins = admins.filter(a => a.shopId === shop.id || a.role === 'superuser');

            return (
              <div
                key={shop.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 shadow-xl ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-amber-500/5'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0 relative">
                        <img 
                          src={shop.logoUrl} 
                          alt={shop.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{shop.name}</h4>
                        <p className="text-[11px] text-neutral-400 truncate">{shop.slogan}</p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-neutral-950 shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Unidade Ativa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Filial
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2 text-xs text-neutral-400">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span className="truncate">{shop.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                      <span>{shop.phoneWhatsApp}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0 text-neutral-500" />
                      <span>{shop.openingTime} às {shop.closingTime} • intervalos {shop.slotIntervalMinutes}min</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-neutral-400">
                    <span className="font-semibold text-white">{shopAdmins.length}</span> {shopAdmins.length === 1 ? 'admin' : 'admins'}
                  </div>

                  <div className="flex items-center gap-2">
                    {barbershops.length > 1 && !isActive && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir a filial "${shop.name}"?`)) {
                            deleteBarbershop(shop.id);
                          }
                        }}
                        title="Excluir filial"
                        className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        switchBarbershop(shop.id);
                        setActiveView('dashboard');
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 hover:bg-amber-400'
                          : 'bg-neutral-800 text-white hover:bg-neutral-700'
                      }`}
                    >
                      <span>{isActive ? 'Abrir Painel' : 'Acessar Unidade'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
