import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Scissors, 
  User, 
  Phone, 
  CheckCircle2, 
  MessageSquare, 
  MapPin, 
  CalendarPlus, 
  Download, 
  AlertCircle,
  Share2,
  ChevronRight,
  ArrowLeft,
  XCircle,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBarber } from '../context/BarberContext';
import { Service, Barber, Appointment } from '../types';
import { 
  formatCurrency, 
  formatDateBR, 
  openWhatsApp, 
  getBookingConfirmationMessage,
  getCancellationMessage
} from '../utils/whatsapp';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

export const ClientBookingView: React.FC = () => {
  const { profile, services, barbers, appointments, addAppointment, cancelAppointment } = useBarber();

  const [activeTab, setActiveTab] = useState<'book' | 'my_bookings'>('book');

  // Booking form state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Confirmation result
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone lookup for existing bookings
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedAppointments, setSearchedAppointments] = useState<Appointment[] | null>(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Available dates for the next 14 days
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      // Check if open on this day
      if (profile.daysOpen.includes(dayOfWeek)) {
        const iso = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        const dayNumber = d.getDate();
        const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
        dates.push({ iso, dayName, dayNumber, monthName });
      }
    }
    return dates;
  }, [profile.daysOpen]);

  // Generate slots for the selected date and barber
  const timeSlots = useMemo(() => {
    const [startH, startM] = profile.openingTime.split(':').map(Number);
    const [endH, endM] = profile.closingTime.split(':').map(Number);
    const interval = profile.slotIntervalMinutes || 30;

    const slots: string[] = [];
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + interval <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += interval;
    }

    // Filter already booked slots and lunch break for this date and barber
    return slots.map(slot => {
      const isLunch = Boolean(
        profile.lunchBreakEnabled && 
        profile.lunchStart && 
        profile.lunchEnd && 
        slot >= profile.lunchStart && 
        slot < profile.lunchEnd
      );

      const isBooked = appointments.some(apt => {
        if (apt.date !== selectedDate || apt.status === 'cancelled') return false;
        if (apt.time !== slot) return false;
        if (selectedBarber && apt.barberId !== selectedBarber.id) return false;
        return true;
      });

      return {
        time: slot,
        available: !isBooked && !isLunch,
        isLunch
      };
    });
  }, [profile.openingTime, profile.closingTime, profile.slotIntervalMinutes, profile.lunchBreakEnabled, profile.lunchStart, profile.lunchEnd, appointments, selectedDate, selectedBarber]);

  // Handle client appointment submission
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime || !customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (Serviço, Horário, Nome e WhatsApp).');
      return;
    }

    setIsSubmitting(true);

    const chosenBarber = selectedBarber || barbers[0];

    const newApt = addAppointment({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      barberId: chosenBarber.id,
      barberName: chosenBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      notes: notes.trim() || undefined
    });

    setConfirmedAppointment(newApt);
    setIsSubmitting(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  const handleSendWhatsAppNotification = (apt: Appointment) => {
    const calendarUrl = createGoogleCalendarUrl(apt, profile);
    const message = getBookingConfirmationMessage(apt, profile, calendarUrl);
    openWhatsApp(apt.customerPhone, message);
  };

  const handleClientCancelConfirm = () => {
    if (!cancelModalAppointment) return;
    cancelAppointment(cancelModalAppointment.id, cancelReason || 'Cancelamento solicitado pelo cliente via portal', 'client');
    
    // Auto trigger WhatsApp cancellation message to the barber shop
    const cancelMsg = getCancellationMessage(cancelModalAppointment, profile, cancelReason, 'client');
    openWhatsApp(profile.phoneWhatsApp, cancelMsg);

    setCancelModalAppointment(null);
    setCancelReason('');

    // Update searched appointments list
    if (searchedAppointments) {
      setSearchedAppointments(prev => 
        prev ? prev.map(a => a.id === cancelModalAppointment.id ? { ...a, status: 'cancelled' } : a) : null
      );
    }
  };

  const handleSearchBookings = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = searchPhone.replace(/\D/g, '');
    if (!digits) return;
    const results = appointments.filter(a => a.customerPhone.replace(/\D/g, '').includes(digits));
    setSearchedAppointments(results);
  };

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return services;
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Banner & Barber shop Presentation Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="h-44 sm:h-56 relative overflow-hidden bg-neutral-950">
          <img 
            src={profile.coverUrl} 
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 pt-0 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-neutral-950 shadow-xl bg-neutral-800 flex-shrink-0">
              <img 
                src={profile.logoUrl} 
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.name}
              </h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                {profile.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-neutral-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {profile.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Seg-Sáb: {profile.openingTime} às {profile.closingTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => openWhatsApp(profile.phoneWhatsApp, `Olá! Vim pelo link de agendamento da ${profile.name} e gostaria de tirar uma dúvida.`)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp da Barbearia</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Novo Agendamento vs Meus Agendamentos) */}
        <div className="flex border-t border-neutral-800/80 bg-neutral-950/40 px-6 py-2 gap-3">
          <button
            onClick={() => { setActiveTab('book'); setConfirmedAppointment(null); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'book'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Agendar Novo Horário</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_bookings'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>Consultar / Cancelar Meus Horários</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BOOKING CONFIRMATION SCREEN */}
      {confirmedAppointment && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Agendamento Confirmado com Sucesso!
            </h3>
            <p className="text-sm text-neutral-400 mt-2">
              Seu horário foi reservado em tempo real no sistema da barbearia.
            </p>
          </div>

          <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800 max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="text-xs text-neutral-400">Barbearia</div>
              <div className="font-bold text-white text-sm">{profile.name}</div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="text-xs text-neutral-400">Serviço Escolhido</div>
              <div className="font-bold text-amber-400 text-sm">{confirmedAppointment.serviceName}</div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="text-xs text-neutral-400">Profissional / Barbeiro</div>
              <div className="font-bold text-white text-sm">{confirmedAppointment.barberName}</div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="text-xs text-neutral-400">Data e Horário</div>
              <div className="font-bold text-white text-sm">
                {formatDateBR(confirmedAppointment.date)} às {confirmedAppointment.time}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400">Valor Estimado</div>
              <div className="font-extrabold text-emerald-400 text-base">
                {formatCurrency(confirmedAppointment.servicePrice)}
              </div>
            </div>
          </div>

          {/* High Priority Actions for WhatsApp and Google Calendar */}
          <div className="max-w-xl mx-auto mt-6 space-y-3">
            {/* WhatsApp automated message dispatch */}
            <button
              onClick={() => handleSendWhatsAppNotification(confirmedAppointment)}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 group"
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Receber Confirmação & Lembrete no WhatsApp</span>
            </button>

            {/* Google Calendar Direct Integration */}
            <a
              href={createGoogleCalendarUrl(confirmedAppointment, profile)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <CalendarPlus className="w-5 h-5" />
              <span>Adicionar ao Google Calendar</span>
            </a>

            {/* iCal Download */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadIcsFile(confirmedAppointment, profile)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
              >
                <Download className="w-4 h-4 text-neutral-400" />
                <span>Baixar .iCal (Apple/Outlook)</span>
              </button>

              <button
                onClick={() => {
                  setConfirmedAppointment(null);
                  setSelectedService(null);
                  setSelectedTime('');
                  setActiveTab('book');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
              >
                <span>Fazer Outro Agendamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BOOKING WIZARD FORM */}
      {!confirmedAppointment && activeTab === 'book' && (
        <form onSubmit={handleBookAppointment} className="space-y-8">
          
          {/* STEP 1: CHOOSE SERVICE */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Etapa 1 de 4</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Escolha o Serviço</h3>
              </div>

              {/* Categories filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {['all', 'cabelo', 'barba', 'combo', 'estetica'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {filteredServices.map(srv => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          {srv.name}
                        </h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {srv.description}
                      </p>
                      <div className="flex items-center gap-3 pt-2 text-xs font-medium">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {srv.durationMinutes} min
                        </span>
                        <span className="text-emerald-400 font-bold text-sm">
                          {formatCurrency(srv.price)}
                        </span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CHOOSE BARBER */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="pb-4 border-b border-neutral-800">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Etapa 2 de 4</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Escolha o Barbeiro</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Selecione o profissional de sua preferência ou qualquer um disponível.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {barbers.map(barber => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`cursor-pointer rounded-2xl p-4 border text-center transition-all flex flex-col items-center ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-amber-500/40 shadow-inner bg-neutral-800">
                      <img 
                        src={barber.photoUrl} 
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-white text-sm truncate max-w-full">
                      {barber.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {barber.specialty}
                    </p>
                    <span className={`mt-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {isSelected ? 'Selecionado' : 'Escolher'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: DATE & TIME */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="pb-4 border-b border-neutral-800">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Etapa 3 de 4</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Escolha Data e Horário</h3>
            </div>

            {/* Date Picker Carousel */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-neutral-400 mb-2">
                1. Selecione a Data:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map(item => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.iso);
                        setSelectedTime('');
                      }}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider">{item.dayName}</span>
                      <span className="text-lg font-black">{item.dayNumber}</span>
                      <span className="text-[10px] capitalize">{item.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <label className="block text-xs font-semibold text-neutral-400">
                  2. Selecione o Horário Disponível:
                </label>
                {profile.lunchBreakEnabled && profile.lunchStart && profile.lunchEnd && (
                  <span className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Almoço: {profile.lunchStart} às {profile.lunchEnd}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      title={slot.isLunch ? 'Pausa para almoço da barbearia' : !slot.available ? 'Horário já reservado' : 'Disponível'}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                        slot.isLunch
                          ? 'bg-neutral-950/30 border-neutral-900/80 text-neutral-600 cursor-not-allowed opacity-60'
                          : !slot.available
                          ? 'bg-neutral-950/40 border-neutral-900 text-neutral-600 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500 border-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <span>{slot.time}</span>
                      {slot.isLunch && (
                        <span className="block text-[9px] font-normal text-neutral-500 tracking-tight">Almoço</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 4: CUSTOMER DETAILS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="pb-4 border-b border-neutral-800">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Etapa 4 de 4</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Seus Dados de Contato</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Utilizado para o envio da confirmação no WhatsApp e lembretes do horário.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  WhatsApp com DDD (para confirmação) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Observações / Preferências de Estilo (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prefiro tesoura no topo, barba alinhada com toalha morna..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Summary Box & Submit */}
            <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-neutral-400">Resumo do Agendamento:</div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{selectedService?.name || 'Selecione um serviço'}</span>
                  {selectedTime && (
                    <span className="text-amber-400">
                      • {formatDateBR(selectedDate)} às {selectedTime}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedService || !selectedTime || !customerName || !customerPhone}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Confirmar Agendamento</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 3: MEUS AGENDAMENTOS & CANCELAMENTO FÁCIL */}
      {activeTab === 'my_bookings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Consultar & Cancelar Meus Horários</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Digite seu número de WhatsApp para localizar seus agendamentos e gerenciar cancelamentos com aviso prévio imediato.
              </p>
            </div>

            <form onSubmit={handleSearchBookings} className="flex gap-2 mb-8">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Seu WhatsApp (ex: 11988887777)"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Results list */}
            {searchedAppointments !== null && (
              <div className="space-y-3">
                {searchedAppointments.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    Nenhum agendamento encontrado com este número de telefone.
                  </div>
                ) : (
                  searchedAppointments.map(apt => {
                    const isCancelled = apt.status === 'cancelled';
                    const isCompleted = apt.status === 'completed';

                    return (
                      <div 
                        key={apt.id}
                        className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{apt.serviceName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCancelled 
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40' 
                                : isCompleted 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            }`}>
                              {isCancelled ? 'Cancelado' : isCompleted ? 'Concluído' : 'Agendado'}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            Barbeiro: <strong className="text-neutral-200">{apt.barberName}</strong> • {formatDateBR(apt.date)} às {apt.time}
                          </div>
                          <div className="text-xs text-emerald-400 font-bold">
                            {formatCurrency(apt.servicePrice)}
                          </div>
                          {apt.cancellationReason && (
                            <div className="text-[11px] text-rose-400">
                              Motivo cancelamento: {apt.cancellationReason}
                            </div>
                          )}
                        </div>

                        {!isCancelled && !isCompleted && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setCancelModalAppointment(apt)}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs border border-rose-800/60 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Cancelar Horário</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANCEL MODAL WITH IMMEDIATE NOTICE */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Cancelar Agendamento?</h3>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              Você está prestes a cancelar o horário de <strong className="text-white">{cancelModalAppointment.serviceName}</strong> no dia <strong className="text-white">{formatDateBR(cancelModalAppointment.date)} às {cancelModalAppointment.time}</strong> com {cancelModalAppointment.barberName}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Motivo do cancelamento (opcional):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Tive um compromisso urgente de trabalho..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleClientCancelConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
