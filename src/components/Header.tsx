import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Scissors, 
  Bell, 
  Copy, 
  Check, 
  Sparkles,
  UserCheck,
  ShieldCheck,
  Lock,
  LogOut,
  User
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenCustomizer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNotifications, 
  onOpenCustomizer 
}) => {
  const { 
    profile, 
    activeView, 
    setActiveView, 
    notifications, 
    currentAdmin, 
    currentAdminBarber,
    logoutAdmin 
  } = useBarber();
  const [copiedLink, setCopiedLink] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCopyClientLink = () => {
    const url = window.location.origin + window.location.pathname + '#agendar';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand & Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
            onClick={() => setActiveView(currentAdmin ? 'dashboard' : 'client')}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-lg shadow-amber-500/10 flex-shrink-0 bg-neutral-800">
              <img 
                src={profile.logoUrl} 
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div 
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: profile.primaryColor }}
              />
            </div>
            
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-neutral-100 tracking-tight truncate group-hover:text-amber-400 transition-colors">
                  {profile.name}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate hidden md:block">
                {profile.slogan || 'Sistema de Agendamento & Faturamento'}
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800/80">
            {currentAdmin ? (
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agenda & Atendimentos</span>
                </button>

                <button
                  onClick={() => setActiveView('client')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'client'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Portal do Cliente</span>
                </button>

                <button
                  onClick={() => setActiveView('finance')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'finance'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Faturamento & Recibos</span>
                </button>

                <button
                  onClick={() => setActiveView('services')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'services'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <Scissors className="w-4 h-4 text-neutral-300" />
                  <span>Serviços & Barbeiros</span>
                </button>

                {currentAdmin?.username === 'superuser' && (
                  <button
                    onClick={() => setActiveView('admins')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeView === 'admins'
                        ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Administradores</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('client')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'client'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Agendamento Online</span>
                </button>

                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeView !== 'client'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acesso do Administrador</span>
                </button>
              </>
            )}
          </nav>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2">
            {/* Share / Copy Client Booking Link */}
            <button
              onClick={handleCopyClientLink}
              title="Copiar link de agendamento online para enviar ao cliente"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 transition-colors shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Link de Agendamento</span>
                </>
              )}
            </button>

            {/* Admin User Badge & Logout */}
            {currentAdmin ? (
              <div className="flex items-center gap-1.5 bg-neutral-950/80 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-amber-400 font-mono text-[11px] hidden sm:inline">
                    @{currentAdmin.username}
                  </span>
                  {currentAdminBarber && (
                    <span className="text-[10px] text-neutral-400 hidden md:inline font-medium">
                      • {currentAdminBarber.name.split(' ')[0]}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">
                    (ADM)
                  </span>
                </div>
                <div className="h-3 w-px bg-neutral-800 mx-0.5" />
                <button
                  onClick={logoutAdmin}
                  title="Sair da conta de administrador"
                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('dashboard')}
                className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar ADM</span>
              </button>
            )}

            {/* Theme & Shop Customizer (available to admin or shop owner) */}
            <button
              onClick={onOpenCustomizer}
              title="Personalizar cores, logo e dados da barbearia"
              className="p-2 rounded-xl text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 transition-colors"
              title="Notificações em tempo real"
            >
              <Bell className="w-4 h-4 text-neutral-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-neutral-800/60 scrollbar-none text-xs">
          {currentAdmin ? (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeView === 'dashboard' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Agenda
              </button>
              <button
                onClick={() => setActiveView('client')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeView === 'client' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Portal Cliente
              </button>
              <button
                onClick={() => setActiveView('finance')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeView === 'finance' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Faturamento
              </button>
              <button
                onClick={() => setActiveView('services')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeView === 'services' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Serviços
              </button>
              {currentAdmin?.username === 'superuser' && (
                <button
                  onClick={() => setActiveView('admins')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeView === 'admins' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  Administradores
                </button>
              )}
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-rose-400 hover:bg-rose-950/30"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('client')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeView === 'client' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Portal do Cliente
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  activeView !== 'client' ? 'bg-amber-500 text-neutral-950' : 'text-amber-400'
                }`}
              >
                Entrar como Administrador
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

