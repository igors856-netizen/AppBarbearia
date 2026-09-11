import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  DollarSign, 
  Plus, 
  Search, 
  CalendarCheck, 
  Filter, 
  Scissors, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  AlertCircle,
  Share2,
  Bell,
  Sparkles
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Appointment, AppointmentStatus, PaymentMethod, Receipt } from '../types';
import { 
  openWhatsApp, 
  getReminderMessage, 
  getCancellationMessage, 
  formatCurrency, 
  formatDateBR 
} from '../utils/whatsapp';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface BarberDashboardProps {
  onOpenReceipt: (receipt: Receipt) => void;
  onOpenCustomizer?: () => void;
  onOpenNotifications?: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ 
  onOpenReceipt,
  onOpenCustomizer,
  onOpenNotifications
}) => {
  const { 
    profile, 
    barbers, 
    services, 
    appointments, 
    updateAppointmentStatus, 
    markAppointmentAsPaid, 
    cancelAppointment, 
    addAppointment,
    currentAdmin,
    receipts,
    notifications
  } = useBarber();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Date selection (default today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filter barber: if admin has a linked barberId, default to it, else 'all'
  const [filterBarberId, setFilterBarberId] = useState<string>(() => {
    return currentAdmin?.barberId || 'all';
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Walk-in Appointment Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualBarberId, setManualBarberId] = useState(barbers[0]?.id || '');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || '');
  const [manualTime, setManualTime] = useState('14:00');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<PaymentMethod>('pix');

  // Cancel reason prompt
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Navigate dates
  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setDateToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filtered Appointments for the selected day
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Date filter
      if (apt.date !== selectedDate) return false;
      // Barber filter
      if (filterBarberId !== 'all' && apt.barberId !== filterBarberId) return false;
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = 
          apt.customerName.toLowerCase().includes(query) ||
          apt.customerPhone.includes(query) ||
          apt.serviceName.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, filterBarberId, statusFilter, searchTerm]);

  // Daily statistics
  const dayStats = useMemo(() => {
    const dayApts = appointments.filter(a => a.date === selectedDate && (filterBarberId === 'all' || a.barberId === filterBarberId));
    const totalCount = dayApts.length;
    const completedCount = dayApts.filter(a => a.status === 'completed').length;
    const scheduledCount = dayApts.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const cancelledCount = dayApts.filter(a => a.status === 'cancelled').length;
    const estimatedTotal = dayApts
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + a.servicePrice, 0);
    const paidTotal = dayApts
      .filter(a => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.servicePrice, 0);

    return { totalCount, completedCount, scheduledCount, cancelledCount, estimatedTotal, paidTotal };
  }, [appointments, selectedDate, filterBarberId]);

  const handleSendReminder = (apt: Appointment) => {
    const msg = getReminderMessage(apt, profile);
    openWhatsApp(apt.customerPhone, msg);
  };

  const handleCompleteAndPay = (apt: Appointment, method: PaymentMethod = 'pix') => {
    const receipt = markAppointmentAsPaid(apt.id, method);
    if (receipt) {
      onOpenReceipt(receipt);
    }
  };

  const handleConfirmCancel = (apt: Appointment) => {
    cancelAppointment(apt.id, cancelReason || 'Cancelado pela administração', 'barber');
    
    // Notify customer via WhatsApp
    const msg = getCancellationMessage(apt, profile, cancelReason, 'barber');
    openWhatsApp(apt.customerPhone, msg);

    setCancellingAptId(null);
    setCancelReason('');
  };

  const handleCreateManualAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const barber = barbers.find(b => b.id === manualBarberId) || barbers[0];
    const service = services.find(s => s.id === manualServiceId) || services[0];
    if (!barber || !service) return;

    addAppointment({
      customerName: manualName.trim(),
      customerPhone: manualPhone.trim() || '5511999998888',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      date: selectedDate,
      time: manualTime,
      paymentMethod: manualPaymentMethod,
      paymentStatus: 'pending'
    });

    setShowManualModal(false);
    setManualName('');
    setManualPhone('');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Controls: Date Navigator & Barber Switcher */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateBy(1)}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={setDateToday}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-xl border border-neutral-700 transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* Barber filter and Add button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">Cadeira:</span>
              <select
                value={filterBarberId}
                onChange={(e) => setFilterBarberId(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">Todas as Cadeiras (Geral)</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {currentAdmin?.barberId === b.id ? '★ (Minha)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                title="Central de Notificações"
                className="relative flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all text-xs font-semibold"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Notificações</span>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-neutral-950 text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {onOpenCustomizer && (
              <button
                type="button"
                onClick={onOpenCustomizer}
                title="Personalizar Barbearia"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Personalizar</span>
              </button>
            )}

            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Encaixe</span>
            </button>
          </div>

        </div>

        {/* Daily Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[11px] font-semibold text-neutral-400 block">Agendados no Dia</span>
            <span className="text-xl font-black text-white mt-1 block">
              {dayStats.totalCount} <span className="text-xs font-medium text-neutral-500">clientes</span>
            </span>
          </div>

          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[11px] font-semibold text-neutral-400 block">Finalizados</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {dayStats.completedCount}
            </span>
          </div>

          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[11px] font-semibold text-neutral-400 block">Estimativa de Faturamento</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {formatCurrency(dayStats.estimatedTotal)}
            </span>
          </div>

          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[11px] font-semibold text-neutral-400 block">Total Recebido (Caixa)</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(dayStats.paidTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'scheduled', label: 'Agendados' },
            { id: 'confirmed', label: 'Confirmados' },
            { id: 'completed', label: 'Finalizados' },
            { id: 'cancelled', label: 'Cancelados' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente ou fone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Appointment Timeline List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 space-y-2">
            <CalendarCheck className="w-10 h-10 mx-auto opacity-30 text-neutral-400" />
            <p className="text-sm font-semibold text-neutral-300">Nenhum agendamento encontrado</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Não há horários marcados para {formatDateBR(selectedDate)} com os filtros atuais.
            </p>
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const receipt = receipts.find(r => r.appointmentId === apt.id);
            return (
              <div
                key={apt.id}
                className={`bg-neutral-900 border rounded-3xl p-5 transition-all shadow-md ${
                  apt.status === 'completed'
                    ? 'border-neutral-800/80 bg-neutral-900/50 opacity-80'
                    : apt.status === 'cancelled'
                    ? 'border-rose-900/30 bg-rose-950/10 opacity-70'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Time, Customer & Service Info */}
                  <div className="flex items-start gap-4">
                    <div className="px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-center flex-shrink-0">
                      <span className="text-base font-black text-amber-400 block font-mono">
                        {apt.time}
                      </span>
                      <span className="text-[10px] text-neutral-500 block font-medium">
                        {formatDateBR(apt.date)}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-white truncate">{apt.customerName}</h4>
                        
                        {/* Status Badges */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          apt.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          apt.status === 'completed' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {apt.status === 'confirmed' ? 'Confirmado' :
                           apt.status === 'scheduled' ? 'Agendado' :
                           apt.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.paymentStatus === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}>
                          {apt.paymentStatus === 'paid' ? 'Pago' : 'Pagamento Pendente'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                        <span className="text-neutral-200 font-semibold">{apt.serviceName}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">Barbeiro: {apt.barberName}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(apt.servicePrice)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 pt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {apt.customerPhone}
                        </span>
                        {apt.notes && (
                          <span className="italic text-neutral-400 truncate max-w-xs">
                            Obs: "{apt.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                    
                    {/* WhatsApp Reminder */}
                    <button
                      onClick={() => handleSendReminder(apt)}
                      title="Enviar Lembrete de Horário via WhatsApp"
                      className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-600/50 text-neutral-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Lembrete</span>
                    </button>

                    {/* Google Calendar Link */}
                    <a
                      href={createGoogleCalendarUrl(apt, profile)}
                      target="_blank"
                      rel="noreferrer"
                      title="Adicionar à Google Agenda"
                      className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </a>

                    {/* Status Toggle buttons */}
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold rounded-xl border border-emerald-500/30 transition-all"
                      >
                        Confirmar
                      </button>
                    )}

                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCompleteAndPay(apt, apt.paymentMethod || 'pix')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluir & Recibo</span>
                      </button>
                    )}

                    {/* Show Receipt if paid */}
                    {receipt && (
                      <button
                        onClick={() => onOpenReceipt(receipt)}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Recibo</span>
                      </button>
                    )}

                    {/* Cancellation Trigger */}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => setCancellingAptId(apt.id)}
                        className="p-2.5 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                        title="Cancelar Agendamento"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>

                {/* Cancel Prompt Inline */}
                {cancellingAptId === apt.id && (
                  <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-rose-900/50 space-y-3">
                    <p className="text-xs font-semibold text-rose-300">
                      Confirmação de Cancelamento do Agendamento de {apt.customerName}:
                    </p>
                    <input
                      type="text"
                      placeholder="Motivo (ex: Barbeiro teve imprevisto, cliente reagendou...)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setCancellingAptId(null)}
                        className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handleConfirmCancel(apt)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Confirmar e Notificar no WhatsApp
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Manual Appointment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Adicionar Encaixe / Agendamento Manual</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Henrique"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="Ex: 11988887777"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Profissional</label>
                  <select
                    value={manualBarberId}
                    onChange={(e) => setManualBarberId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Horário</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Serviço</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Forma de Pagamento</label>
                <select
                  value={manualPaymentMethod}
                  onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="card_credit">Cartão de Crédito</option>
                  <option value="card_debit">Cartão de Débito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
                >
                  Salvar Encaixe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
