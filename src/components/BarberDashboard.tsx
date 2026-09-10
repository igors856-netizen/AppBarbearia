import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  DollarSign, 
  Plus, 
  Search, 
  CalendarPlus, 
  Download, 
  AlertCircle,
  Receipt as ReceiptIcon,
  Phone,
  User,
  Scissors
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Appointment, PaymentMethod, Service, Barber } from '../types';
import { 
  formatCurrency, 
  formatDateBR, 
  openWhatsApp, 
  getBookingConfirmationMessage,
  getReminderMessage,
  getCancellationMessage
} from '../utils/whatsapp';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface BarberDashboardProps {
  onOpenReceipt: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ onOpenReceipt }) => {
  const { 
    profile, 
    barbers, 
    services, 
    appointments, 
    confirmAppointment, 
    completeAppointment, 
    cancelAppointment, 
    addAppointment,
    setSelectedReceipt,
    receipts,
    currentAdmin,
    currentAdminBarber
  } = useBarber();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [filterDate, setFilterDate] = useState<string>(todayStr);

  // Initialize filterBarber with the current administrator's assigned barber schedule
  const initialBarberId = useMemo(() => {
    if (currentAdminBarber?.id) return currentAdminBarber.id;
    if (currentAdmin?.barberId) return currentAdmin.barberId;
    const match = barbers.find(b => b.name.toLowerCase() === currentAdmin?.name.toLowerCase());
    return match?.id || 'all';
  }, [currentAdmin, currentAdminBarber, barbers]);

  const [filterBarber, setFilterBarber] = useState<string>(initialBarberId);

  // Ensure when an admin logs in or switches, their personal schedule is selected
  useEffect(() => {
    if (currentAdminBarber?.id) {
      setFilterBarber(currentAdminBarber.id);
    } else if (currentAdmin?.barberId) {
      setFilterBarber(currentAdmin.barberId);
    }
  }, [currentAdmin?.id, currentAdminBarber?.id]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Complete modal state
  const [completingApt, setCompletingApt] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Cancel modal state
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Quick manual appointment modal
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualBarberId, setManualBarberId] = useState(barbers[0]?.id || '');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || '');
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualTime, setManualTime] = useState('14:00');
  const [manualNotes, setManualNotes] = useState('');

  // When opening manual modal, pre-select the currently active agenda barber
  useEffect(() => {
    if (showNewAptModal) {
      if (filterBarber !== 'all') {
        setManualBarberId(filterBarber);
      } else if (currentAdminBarber?.id) {
        setManualBarberId(currentAdminBarber.id);
      }
    }
  }, [showNewAptModal, filterBarber, currentAdminBarber]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (filterDate && apt.date !== filterDate) return false;
      if (filterBarber !== 'all' && apt.barberId !== filterBarber) return false;
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = apt.customerName.toLowerCase().includes(q);
        const matchPhone = apt.customerPhone.includes(q);
        const matchService = apt.serviceName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService) return false;
      }
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDate, filterBarber, filterStatus, searchQuery]);

  // Selected barber name for labels
  const selectedBarberObj = useMemo(() => {
    if (filterBarber === 'all') return null;
    return barbers.find(b => b.id === filterBarber) || null;
  }, [filterBarber, barbers]);

  // Today metrics - calculated specifically for the active agenda
  const todayMetrics = useMemo(() => {
    const todayList = appointments.filter(a => {
      if (a.date !== todayStr) return false;
      if (filterBarber !== 'all' && a.barberId !== filterBarber) return false;
      return true;
    });

    const totalToday = todayList.length;
    const completed = todayList.filter(a => a.status === 'completed');
    const scheduled = todayList.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
    const cancelled = todayList.filter(a => a.status === 'cancelled');

    const expectedRevenue = todayList
      .filter(a => a.status !== 'cancelled')
      .reduce((acc, curr) => acc + curr.servicePrice, 0);

    const realizedRevenue = completed.reduce((acc, curr) => acc + curr.servicePrice, 0);

    return {
      totalToday,
      completedCount: completed.length,
      scheduledCount: scheduled.length,
      cancelledCount: cancelled.length,
      expectedRevenue,
      realizedRevenue
    };
  }, [appointments, todayStr, filterBarber]);

  // Actions
  const handleConfirmCompletion = () => {
    if (!completingApt) return;
    const receipt = completeAppointment(completingApt.id, paymentMethod);
    setSelectedReceipt(receipt);
    setCompletingApt(null);
    onOpenReceipt();
  };

  const handleConfirmCancellation = () => {
    if (!cancellingApt) return;
    cancelAppointment(cancellingApt.id, cancelReason || 'Cancelamento registrado pela barbearia', 'barber');
    
    // Offer WhatsApp dispatch to alert the customer immediately
    const msg = getCancellationMessage(cancellingApt, profile, cancelReason, 'barber');
    openWhatsApp(cancellingApt.customerPhone, msg);

    setCancellingApt(null);
    setCancelReason('');
  };

  const handleSendReminder = (apt: Appointment) => {
    const msg = getReminderMessage(apt, profile);
    openWhatsApp(apt.customerPhone, msg);
  };

  const handleSendConfirmation = (apt: Appointment) => {
    const calendarUrl = createGoogleCalendarUrl(apt, profile);
    const msg = getBookingConfirmationMessage(apt, profile, calendarUrl);
    openWhatsApp(apt.customerPhone, msg);
  };

  const handleCreateManualAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone) return;

    const srv = services.find(s => s.id === manualServiceId) || services[0];
    const brb = barbers.find(b => b.id === manualBarberId) || barbers[0];

    addAppointment({
      customerName: manualName,
      customerPhone: manualPhone,
      barberId: brb.id,
      barberName: brb.name,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      date: manualDate,
      time: manualTime,
      notes: manualNotes
    });

    setShowNewAptModal(false);
    setManualName('');
    setManualPhone('');
    setManualNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* SEPARATE AGENDA SELECTOR & ADMIN IDENTITY BANNER */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg flex-shrink-0 shadow-inner overflow-hidden">
              {selectedBarberObj?.photoUrl ? (
                <img 
                  src={selectedBarberObj.photoUrl} 
                  alt={selectedBarberObj.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Controle de Agenda
                </span>
                {filterBarber === (currentAdminBarber?.id || currentAdmin?.barberId) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sua Agenda Pessoal
                  </span>
                ) : filterBarber === 'all' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Visão Geral de Todos os Barbeiros
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Agenda de Outro Barbeiro
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {filterBarber === 'all' 
                  ? 'Todas as Agendas (Geral da Barbearia)' 
                  : `Agenda de ${selectedBarberObj?.name || 'Barbeiro'}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <div className="text-xs text-neutral-400 bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-xl">
              Administrador: <strong className="text-white">@{currentAdmin?.username}</strong> ({currentAdmin?.name})
            </div>
          </div>
        </div>

        {/* Dedicated Agenda Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-neutral-500 uppercase whitespace-nowrap mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Agendas:
          </span>

          {/* Current Admin's Personal Agenda Button */}
          {currentAdminBarber && (
            <button
              type="button"
              onClick={() => setFilterBarber(currentAdminBarber.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterBarber === currentAdminBarber.id
                  ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Minha Agenda ({currentAdminBarber.name})</span>
            </button>
          )}

          {/* Other Barbers Schedules */}
          {barbers
            .filter(b => b.id !== currentAdminBarber?.id)
            .map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setFilterBarber(b.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  filterBarber === b.id
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800/70 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Agenda: {b.name}</span>
              </button>
            ))}

          {/* All schedules */}
          <button
            type="button"
            onClick={() => setFilterBarber('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterBarber === 'all'
                ? 'bg-neutral-200 text-neutral-950 font-bold'
                : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <span>Ver Todas as Agendas</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {filterBarber !== 'all' ? `Agendados Hoje (${selectedBarberObj?.name?.split(' ')[0] || 'Barbeiro'})` : 'Agendados Hoje (Geral)'}
            </span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {todayMetrics.scheduledCount}
            <span className="text-xs font-normal text-neutral-500 ml-2">/ {todayMetrics.totalToday} total</span>
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <span>{todayMetrics.completedCount} já concluídos</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {filterBarber !== 'all' ? `Faturado Hoje (${selectedBarberObj?.name?.split(' ')[0] || 'Barbeiro'})` : 'Faturado Hoje (Geral)'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {formatCurrency(todayMetrics.realizedRevenue)}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Previsto: {formatCurrency(todayMetrics.expectedRevenue)}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recibos Emitidos</span>
            <ReceiptIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {receipts.length}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Total histórico no sistema
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelados Hoje</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {todayMetrics.cancelledCount}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Com aviso imediato
          </div>
        </div>
      </div>

      {/* Main Schedule Control & Filter Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Gestão de Horários & Atendimentos</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {filteredAppointments.length} horários
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Visualize a agenda em tempo real, confirme, envie lembretes via WhatsApp e emita recibos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterDate(todayStr)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterDate === todayStr
                  ? 'bg-amber-500 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Hoje
            </button>

            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setFilterDate(d.toISOString().split('T')[0]);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              Amanhã
            </button>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <button
              onClick={() => setShowNewAptModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Horário</span>
            </button>
          </div>
        </div>

        {/* Secondary filters: Barbers, Status, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Barber filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Profissional:
            </label>
            <select
              value={filterBarber}
              onChange={(e) => setFilterBarber(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Barbeiros</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Concluído (Pago)</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Search box */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Buscar Cliente ou Serviço:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Nome, WhatsApp ou Serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List / Grid */}
        <div className="space-y-3 pt-2">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-neutral-950/60 rounded-2xl border border-neutral-800/80">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-300">Nenhum agendamento encontrado</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Não há horários registrados para esta data ou filtros selecionados. Clique em "Novo Horário" para agendar manualmente ou compartilhe seu link de agendamento online.
              </p>
            </div>
          ) : (
            filteredAppointments.map(apt => {
              const isCancelled = apt.status === 'cancelled';
              const isCompleted = apt.status === 'completed';
              const isConfirmed = apt.status === 'confirmed';

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isCancelled
                      ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                      : isCompleted
                      ? 'bg-neutral-950/80 border-emerald-950/60 hover:border-emerald-800/50'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 shadow-sm'
                  }`}
                >
                  {/* Left info: Time badge, customer, service, barber */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                      <span className="text-sm sm:text-base font-black text-white">{apt.time}</span>
                      <span className="text-[9px] text-neutral-400 uppercase">{formatDateBR(apt.date).substring(0, 5)}</span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm sm:text-base truncate">
                          {apt.customerName}
                        </h4>
                        
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                            : isCompleted
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : isConfirmed
                            ? 'bg-blue-950 text-blue-400 border border-blue-800/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}>
                          {isCancelled ? 'Cancelado' : isCompleted ? 'Concluído & Pago' : isConfirmed ? 'Confirmado' : 'Agendado'}
                        </span>

                        {apt.paymentMethod && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                            {apt.paymentMethod.toUpperCase()}
                          </span>
                        )}

                        {apt.barberId === (currentAdminBarber?.id || currentAdmin?.barberId) && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Sua Agenda
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                        <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                          <Scissors className="w-3.5 h-3.5 text-amber-400" />
                          {apt.serviceName} ({formatCurrency(apt.servicePrice)})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neutral-300">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          {apt.barberName}
                        </span>
                        <span>•</span>
                        <a 
                          href={`tel:${apt.customerPhone}`} 
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-neutral-500" />
                          {apt.customerPhone}
                        </a>
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-neutral-400 italic bg-neutral-900/60 px-2 py-1 rounded-md border border-neutral-800/50 mt-1 max-w-xl">
                          "{apt.notes}"
                        </p>
                      )}

                      {apt.cancellationReason && (
                        <p className="text-xs text-rose-400 bg-rose-950/30 px-2.5 py-1 rounded-md border border-rose-900/30 mt-1">
                          Motivo cancelamento: {apt.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Right */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
                    {/* If completed, show "Ver Recibo Digital" */}
                    {isCompleted && (
                      <button
                        onClick={() => {
                          const r = receipts.find(rc => rc.appointmentId === apt.id || rc.id === apt.receiptId);
                          if (r) {
                            setSelectedReceipt(r);
                            onOpenReceipt();
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold border border-neutral-700 transition-colors"
                        title="Ver ou reimprimir recibo digital"
                      >
                        <ReceiptIcon className="w-3.5 h-3.5" />
                        <span>Ver Recibo</span>
                      </button>
                    )}

                    {/* If active, offer Concluir (emite recibo) */}
                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => setCompletingApt(apt)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        title="Concluir atendimento e emitir recibo digital"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Concluir & Recibo</span>
                      </button>
                    )}

                    {/* Confirm appointment if scheduled */}
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => confirmAppointment(apt.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-blue-300 text-xs font-semibold border border-neutral-700 transition-colors"
                        title="Confirmar presença"
                      >
                        <span>Confirmar</span>
                      </button>
                    )}

                    {/* WhatsApp automated options */}
                    <div className="relative group">
                      <button
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-xs font-medium border border-emerald-800/40 transition-colors"
                        title="Opções de WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl p-1 shadow-2xl z-20 hidden group-hover:block">
                        <button
                          onClick={() => handleSendConfirmation(apt)}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          Enviar Confirmação
                        </button>
                        <button
                          onClick={() => handleSendReminder(apt)}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          Enviar Lembrete
                        </button>
                        <button
                          onClick={() => openWhatsApp(apt.customerPhone, `Olá, ${apt.customerName}! Falamos da ${profile.name}. Como podemos ajudar?`)}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          Conversar no WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Google Calendar Direct Add */}
                    <a
                      href={createGoogleCalendarUrl(apt, profile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Adicionar ao Google Calendar"
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-400" />
                    </a>

                    {/* Cancel with immediate warning notice */}
                    {!isCancelled && !isCompleted && (
                      <button
                        onClick={() => setCancellingApt(apt)}
                        title="Cancelar com aviso WhatsApp prévio"
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-700 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: COMPLETE APPOINTMENT & ISSUE RECEIPT */}
      {completingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <CheckCircle className="w-7 h-7" />
              <div>
                <h3 className="text-lg font-black text-white">Concluir Atendimento</h3>
                <p className="text-xs text-neutral-400">Emissão automática de recibo digital</p>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Cliente:</span>
                <span className="font-bold text-white">{completingApt.customerName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Serviço:</span>
                <span className="font-bold text-white">{completingApt.serviceName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Profissional:</span>
                <span className="font-bold text-white">{completingApt.barberName}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">Valor Total:</span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(completingApt.servicePrice)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-300">
                Forma de Pagamento Utilizada:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pix', label: 'PIX' },
                  { id: 'card_credit', label: 'Cartão Crédito' },
                  { id: 'card_debit', label: 'Cartão Débito' },
                  { id: 'cash', label: 'Dinheiro' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === opt.id
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingApt(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg shadow-emerald-600/30"
              >
                Finalizar & Gerar Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BARBER CANCEL APPOINTMENT */}
      {cancellingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Cancelar Horário do Cliente</h3>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cancelar agendamento de <strong className="text-white">{cancellingApt.customerName}</strong> em <strong className="text-white">{formatDateBR(cancellingApt.date)} às {cancellingApt.time}</strong>?
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Motivo do cancelamento (enviado no WhatsApp ao cliente):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Manutenção inesperada na cadeira ou indisponibilidade de horário..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingApt(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirmar & Avisar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL APPOINTMENT (NOVO HORÁRIO) */}
      {showNewAptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Novo Agendamento Manual</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Registre um cliente presencial ou recebido via ligação/WhatsApp direto.
            </p>

            <form onSubmit={handleCreateManualAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Ex: Pedro Henrique"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="Ex: 11988887777"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Serviço</label>
                  <select
                    value={manualServiceId}
                    onChange={(e) => setManualServiceId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Barbeiro</label>
                  <select
                    value={manualBarberId}
                    onChange={(e) => setManualBarberId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notas</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Ex: Corte navalhado tradicional..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
