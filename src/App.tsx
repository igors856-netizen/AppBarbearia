import React, { useState } from 'react';
import { BarberProvider, useBarber } from './context/BarberContext';
import { Header } from './components/Header';
import { ClientBookingView } from './components/ClientBookingView';
import { BarberDashboard } from './components/BarberDashboard';
import { FinancialReports } from './components/FinancialReports';
import { ServiceBarberManagement } from './components/ServiceBarberManagement';
import { AdminManagement } from './components/AdminManagement';
import { AppBarbearia } from './components/AppBarbearia';
import { NotificationCenter } from './components/NotificationCenter';
import { ShopCustomizerModal } from './components/ShopCustomizerModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { BarbershopSwitcherModal } from './components/BarbershopSwitcherModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { Receipt } from './types';
import { Scissors, MapPin, Phone, ShieldCheck, Heart, Store, Lock } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, profile, currentAdmin, isSuperUser, setActiveView } = useBarber();

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isShopSwitcherOpen, setIsShopSwitcherOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Navigation */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenShopSwitcher={() => setIsShopSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'client' && <ClientBookingView />}
        
        {activeView === 'dashboard' && (
          currentAdmin ? (
            <BarberDashboard onOpenReceipt={(r) => setActiveReceipt(r)} />
          ) : (
            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md mx-auto my-12 space-y-4">
              <Scissors className="w-12 h-12 mx-auto text-amber-400" />
              <h3 className="text-lg font-bold text-white">Acesso Restrito ao Painel</h3>
              <p className="text-xs text-neutral-400">
                Faça login como administrador ou barbeiro para visualizar e gerenciar a agenda diária.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Entrar com Conta de Administrador
              </button>
            </div>
          )
        )}

        {activeView === 'finance' && (
          currentAdmin ? (
            <FinancialReports onOpenReceipt={(r) => setActiveReceipt(r)} />
          ) : (
            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md mx-auto my-12 space-y-4">
              <h3 className="text-lg font-bold text-white">Acesso Restrito ao Financeiro</h3>
              <p className="text-xs text-neutral-400">
                Faça login como administrador para acessar o faturamento, recibos digitais e relatórios.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Fazer Login
              </button>
            </div>
          )
        )}

        {activeView === 'services' && (
          currentAdmin ? (
            <ServiceBarberManagement />
          ) : (
            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md mx-auto my-12 space-y-4">
              <h3 className="text-lg font-bold text-white">Acesso Administrativo Necessário</h3>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Fazer Login
              </button>
            </div>
          )
        )}

        {activeView === 'app_barbearia' && (
          isSuperUser ? (
            <AppBarbearia />
          ) : (
            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md mx-auto my-12 space-y-4">
              <Store className="w-12 h-12 mx-auto text-amber-400" />
              <h3 className="text-lg font-bold text-white">Acesso Exclusivo AppBarbearia</h3>
              <p className="text-xs text-neutral-400">
                Esta área de monitoramento de todas as unidades é de uso exclusivo do Superusuário.
              </p>
              <button
                onClick={() => setActiveView(currentAdmin ? 'dashboard' : 'client')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Voltar
              </button>
            </div>
          )
        )}

        {activeView === 'admins' && (
          isSuperUser ? (
            <AdminManagement />
          ) : (
            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md mx-auto my-12 space-y-4">
              <Lock className="w-12 h-12 mx-auto text-amber-400" />
              <h3 className="text-lg font-bold text-white">Acesso Restrito ao Superusuário</h3>
              <p className="text-xs text-neutral-400">
                Somente o Superusuário possui permissão para acessar a área de gerenciamento de administradores e cadastrar novos administradores.
              </p>
              <button
                onClick={() => setActiveView(currentAdmin ? 'dashboard' : 'client')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {currentAdmin ? 'Ir para Meu Painel' : 'Agendar Horário'}
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-900 bg-neutral-950/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">{profile.name}</span>
            <span>•</span>
            <span>{profile.address}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('client')}
              className="hover:text-amber-400 transition-colors"
            >
              Agendamento Clientes
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Personalizar Loja
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSupabaseOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Supabase Cloud
            </button>
          </div>
        </div>
      </footer>

      {/* Modals and Slide-overs */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ShopCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
      />

      <AdminLoginScreen
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      <BarbershopSwitcherModal
        isOpen={isShopSwitcherOpen}
        onClose={() => setIsShopSwitcherOpen(false)}
      />

      <DigitalReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

    </div>
  );
};

export default function App() {
  return (
    <BarberProvider>
      <MainLayout />
    </BarberProvider>
  );
}
