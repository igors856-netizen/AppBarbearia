import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Scissors, 
  Bell, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  Lock,
  LogOut,
  User,
  Users,
  Store,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { ActiveView } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenCustomizer: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAdminLogin: () => void;
  onOpenShopSwitcher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenCustomizer,
  onOpenSupabaseModal,
  onOpenAdminLogin,
  onOpenShopSwitcher
}) => {
  const { 
    profile, 
    barbershops,
    activeView, 
    setActiveView, 
    notifications,
    currentAdmin,
    isSuperUser,
    logoutAdmin,
    supabaseConfig
  } = useBarber();

  const [copiedLink, setCopiedLink] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCopyBookingLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; requiresAdmin?: boolean; superUserOnly?: boolean }[] = [
    { id: 'client', label: 'Agendar Horário', icon: <Calendar className="w-4 h-4" /> },
    ...(isSuperUser ? [
      { id: 'app_barbearia' as ActiveView, label: 'AppBarbearia', icon: <Store className="w-4 h-4 text-amber-400" />, superUserOnly: true }
    ] : []),
    { id: 'dashboard', label: 'Painel & Agenda', icon: <Scissors className="w-4 h-4" />, requiresAdmin: true },
    { id: 'finance', label: 'Financeiro & Recibos', icon: <DollarSign className="w-4 h-4" />, requiresAdmin: true },
    { 
      id: 'services', 
      label: isSuperUser ? 'Serviços & Barbeiros' : 'Barbeiros', 
      icon: <Sparkles className="w-4 h-4" />, 
      requiresAdmin: true 
    },
    ...(isSuperUser ? [
      { id: 'admins' as ActiveView, label: 'Gestão de Admins', icon: <Users className="w-4 h-4" />, superUserOnly: true }
    ] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Shop Details */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={isSuperUser ? onOpenShopSwitcher : undefined}
              disabled={!isSuperUser}
              title={isSuperUser ? "Superusuário: Alternar ou gerenciar filiais" : profile.name}
              className={`flex items-center gap-3 text-left ${isSuperUser ? 'group hover:opacity-90 cursor-pointer' : 'cursor-default'}`}
            >
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0 shadow-md">
                <img 
                  src={profile.logoUrl} 
                  alt={profile.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: profile.primaryColor }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate group-hover:text-amber-400 transition-colors">
                    {profile.name}
                  </h1>
                  {isSuperUser && (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-400 truncate hidden sm:block">
                  {profile.slogan}
                </p>
              </div>
            </button>

            {/* Número de unidades visível SOMENTE para o superuser */}
            {isSuperUser && (
              <button
                onClick={onOpenShopSwitcher}
                title="Superusuário: Gerenciar filiais da rede"
                className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <Store className="w-3 h-3 text-amber-400" />
                <span>{barbershops.length} {barbershops.length === 1 ? 'unidade' : 'unidades'}</span>
              </button>
            )}
          </div>

          {/* Navigation Bar (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-950/60 p-1.5 rounded-2xl border border-neutral-800">
            {navItems.map((item) => {
              if (item.requiresAdmin && !currentAdmin) return null;
              if (item.superUserOnly && !isSuperUser) return null;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Admin controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Share booking link */}
            <button
              onClick={handleCopyBookingLink}
              title="Copiar link de agendamento online"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Link Clientes</span>
                </>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              title="Central de Notificações"
              className="relative p-2.5 text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-xl border border-neutral-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Customizer */}
            <button
              onClick={onOpenCustomizer}
              title="Personalizar Barbearia"
              className="p-2.5 text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-xl border border-neutral-700 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            {/* Admin User / Login button */}
            {currentAdmin ? (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl hover:border-neutral-600 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                    {currentAdmin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                      {currentAdmin.name}
                    </p>
                    <p className="text-[10px] text-amber-400 capitalize leading-none mt-0.5">
                      @{currentAdmin.username}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {adminMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setAdminMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                      <p className="text-xs font-bold text-white">{currentAdmin.name}</p>
                      <p className="text-[11px] text-neutral-400">@{currentAdmin.username}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded ${
                        isSuperUser 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {isSuperUser ? 'Superusuário' : (currentAdmin.role === 'admin' ? 'Administrador' : 'Gerente')}
                      </span>
                    </div>

                    {isSuperUser && (
                      <button
                        onClick={() => {
                          setActiveView('app_barbearia');
                          setAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>AppBarbearia (Central)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveView('dashboard');
                        setAdminMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      <span>Minha Agenda</span>
                    </button>

                    {isSuperUser && (
                      <button
                        onClick={() => {
                          setActiveView('admins');
                          setAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gestão de Admins</span>
                      </button>
                    )}

                    {isSuperUser && (
                      <button
                        onClick={() => {
                          onOpenShopSwitcher();
                          setAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Trocar Filial / Criar</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenSupabaseModal();
                        setAdminMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nuvem Supabase</span>
                    </button>

                    <div className="border-t border-neutral-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          logoutAdmin();
                          setAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair do Painel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar (Adm)</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-neutral-800 scrollbar-none">
          {navItems.map((item) => {
            if (item.requiresAdmin && !currentAdmin) return null;
            if (item.superUserOnly && !isSuperUser) return null;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white bg-neutral-950/40 border border-neutral-800/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
