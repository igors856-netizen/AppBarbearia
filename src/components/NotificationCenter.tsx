import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  Scissors, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { InAppNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useBarber();

  if (!isOpen) return null;

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'new_booking':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'cancellation':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'completion':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'sync':
      default:
        return <RefreshCw className="w-4 h-4 text-purple-400" />;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 
           ' · ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central de Notificações</h3>
              <p className="text-xs text-neutral-400">
                {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                title="Limpar todas as notificações"
                className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
              <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-neutral-300">Nenhuma notificação por aqui</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Novos agendamentos, confirmações de atendimento e atualizações da barbearia aparecerão nesta área.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-neutral-950/40 border-neutral-800/80 opacity-75'
                    : 'bg-neutral-800/60 border-amber-500/30 shadow-md shadow-amber-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed break-words">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-neutral-500 mt-2 block font-medium">
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.some(n => !n.read) && (
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-center">
            <button
              onClick={() => notifications.forEach(n => markNotificationAsRead(n.id))}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Marcar todas como lidas
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
