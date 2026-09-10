import React, { useState, useEffect } from 'react';
import { BarberProvider, useBarber } from './context/BarberContext';
import { Header } from './components/Header';
import { ClientBookingView } from './components/ClientBookingView';
import { BarberDashboard } from './components/BarberDashboard';
import { FinancialReports } from './components/FinancialReports';
import { ServiceBarberManagement } from './components/ServiceBarberManagement';
import { AdminManagement } from './components/AdminManagement';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ShopCustomizerModal } from './components/ShopCustomizerModal';

const MainAppContent: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    selectedReceipt, 
    setSelectedReceipt, 
    profile, 
    currentAdmin 
  } = useBarber();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Check URL hash for direct customer booking link (e.g. #agendar or #cliente)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#agendar' || hash === '#cliente' || hash === '#booking') {
      setActiveView('client');
    }
  }, [setActiveView]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Navigation */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {/* Client View is always publicly accessible */}
        {activeView === 'client' ? (
          <ClientBookingView />
        ) : (
          /* Protected Administrative Area: requires login */
          !currentAdmin ? (
            <AdminLoginScreen />
          ) : (
            <>
              {activeView === 'dashboard' && (
                <BarberDashboard onOpenReceipt={() => {}} />
              )}

              {activeView === 'finance' && (
                <FinancialReports onOpenReceipt={() => {}} />
              )}

              {activeView === 'services' && (
                <ServiceBarberManagement />
              )}

              {activeView === 'admins' && (
                currentAdmin.username === 'superuser' ? (
                  <AdminManagement />
                ) : (
                  <BarberDashboard onOpenReceipt={() => {}} />
                )
              )}
            </>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-neutral-300 font-bold">{profile.name}</strong> • Gestão de Barbearia & Agendamentos
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>WhatsApp Automático</span>
            <span>•</span>
            <span>Google Calendar Sync</span>
            <span>•</span>
            <span>Recibos Digitais</span>
            <span>•</span>
            <span>Painel Administrativo Seguro</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DigitalReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ShopCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <BarberProvider>
      <MainAppContent />
    </BarberProvider>
  );
}
