import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  CalendarPlus, 
  XCircle, 
  CheckCircle2, 
  Receipt as ReceiptIcon,
  RefreshCw
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { InAppNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useBarber();

  if (!isOpen) return null;

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'new_booking':
        return <CalendarPlus className="w-4 h-4 text-amber-400" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'completion':
        return <ReceiptIcon className="w-4 h-4 text-emerald-400" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Notificações em Tempo Real</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {notifications.filter(n => !n.read).length} novas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                title="Limpar todas as notificações"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
              Nenhuma notificação no momento. Novos agendamentos e cancelamentos aparecerão aqui em tempo real!
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-neutral-950/60 border-neutral-800/60 text-neutral-400'
                    : 'bg-neutral-950 border-neutral-700/80 text-neutral-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-neutral-300' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                        {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 text-center text-[11px] text-neutral-500">
          Notificações automáticas sincronizadas entre barbeiro e cliente.
        </div>

      </div>
    </div>
  );
};
