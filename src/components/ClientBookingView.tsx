import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Scissors, 
  User, 
  Check, 
  ChevronRight, 
  Smartphone, 
  Sparkles, 
  MapPin, 
  Share2, 
  Download, 
  QrCode, 
  Search, 
  AlertCircle,
  XCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Service, Barber, Appointment, PaymentMethod } from '../types';
import { 
  openWhatsApp, 
  getBookingConfirmationMessage, 
  formatCurrency, 
  formatDateBR, 
  getCancellationMessage 
} from '../utils/whatsapp';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

export const ClientBookingView: React.FC = () => {
  const { 
    profile, 
    services, 
    barbers, 
    appointments, 
    addAppointment, 
    cancelAppointment, 
    getAvailableSlots 
  } = useBarber();

  // Active step
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Client details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Booking Result Modal / State
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search existing appointment state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResults, setLookupResults] = useState<Appointment[] | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter active barbers for this shop
  const activeBarbers = useMemo(() => {
    return barbers.filter(b => b.active);
  }, [barbers]);

  // Available slots for selected barber and date
  const availableSlots = useMemo(() => {
    if (!selectedBarber || !selectedDate) return [];
    return getAvailableSlots(selectedBarber.id, selectedDate);
  }, [selectedBarber, selectedDate, getAvailableSlots]);

  // Categories list
  const categories = [
    { id: 'all', label: 'Todos os Serviços' },
    { id: 'cabelo', label: 'Cabelo' },
    { id: 'barba', label: 'Barba' },
    { id: 'combo', label: 'Combos' },
    { id: 'estetica', label: 'Tratamentos' },
  ];

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return services;
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os passos do agendamento.');
      return;
    }

    setIsSubmitting(true);

    const apt = addAppointment({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      notes: notes.trim() || undefined,
      paymentMethod,
      paymentStatus: 'pending'
    });

    setCreatedAppointment(apt);
    setIsSubmitting(false);

    // Reset selection
    setSelectedTime('');
  };

  const handleSendWhatsAppNotification = (apt: Appointment) => {
    const calUrl = createGoogleCalendarUrl(apt, profile);
    const msg = getBookingConfirmationMessage(apt, profile, calUrl);
    // Open whatsapp directed to barbershop or client
    openWhatsApp(profile.phoneWhatsApp, msg);
  };

  const handleLookupSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = lookupPhone.replace(/\D/g, '');
    if (!cleanDigits) return;

    const results = appointments.filter(a => {
      const aDigits = a.customerPhone.replace(/\D/g, '');
      return aDigits.includes(cleanDigits) || cleanDigits.includes(aDigits);
    });

    setLookupResults(results);
  };

  const handleConfirmCancellation = (apt: Appointment) => {
    cancelAppointment(apt.id, cancelReasonInput || 'Cancelado pelo cliente pelo portal online', 'client');
    
    // Send cancellation message via WhatsApp
    const msg = getCancellationMessage(apt, profile, cancelReasonInput, 'client');
    openWhatsApp(profile.phoneWhatsApp, msg);

    setCancellingId(null);
    setCancelReasonInput('');
    // refresh search list
    if (lookupResults) {
      setLookupResults(prev => prev ? prev.map(p => p.id === apt.id ? { ...p, status: 'cancelled' } : p) : null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner with Shop Identity */}
      <section className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="h-44 sm:h-56 w-full relative">
          <img 
            src={profile.coverUrl} 
            alt={profile.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
        </div>

        <div className="relative px-6 sm:px-8 pb-8 pt-4 -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-neutral-900 shadow-2xl flex-shrink-0">
              <img 
                src={profile.logoUrl} 
                alt={profile.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Agendamento Online 24h
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Aberto Hoje
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                {profile.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {profile.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {profile.openingTime} às {profile.closingTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-2xl border border-neutral-700 transition-all shadow-md"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Meus Agendamentos</span>
            </button>
            <button
              type="button"
              onClick={() => openWhatsApp(profile.phoneWhatsApp, `Olá! Gostaria de tirar uma dúvida sobre a ${profile.name}.`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Falar no WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* Main Booking Flow */}
      <form onSubmit={handleBook} className="space-y-8">

        {/* Step 1: Services */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">Escolha o Serviço Desejado</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1 pl-8">
                Cortes modernos, barboterapia, químicas e tratamentos completos
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {filteredServices.map(service => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.01]'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-950'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{service.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-extrabold text-white block">
                        {formatCurrency(service.price)}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-amber-400/90 capitalize">
                      {service.category}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-neutral-950'
                        : 'border-neutral-700 bg-neutral-900 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Barbers */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">Escolha o Profissional</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 pl-8">
              Nossa equipe de especialistas pronta para lhe atender com técnica e precisão
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {activeBarbers.map(barber => {
              const isSelected = selectedBarber?.id === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarber(barber);
                    setSelectedTime(''); // Reset slot on barber switch
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.01]'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-950'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0 relative">
                    <img 
                      src={barber.photoUrl} 
                      alt={barber.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{barber.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400 font-medium truncate mt-0.5">{barber.specialty}</p>
                    <p className="text-[11px] text-neutral-400 truncate mt-1">{barber.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Date & Slots */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">Data e Horário</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 pl-8">
              Selecione o dia e verifique os horários livres na cadeira do barbeiro
            </p>
          </div>

          <div className="pt-6 space-y-6">
            {/* Date Picker Input */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Selecione o Dia de Atendimento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Time Slot Grid */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2.5">
                Horários Disponíveis em {formatDateBR(selectedDate)}
                {selectedBarber && ` com ${selectedBarber.name}`}
              </label>

              {!selectedBarber ? (
                <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                  Por favor, selecione um profissional no passo 2 acima para carregar a grade de horários.
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                  Sem horários livres nesta data para o profissional selecionado. Tente escolher outro dia!
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {availableSlots.map(time => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 scale-105'
                            : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Step 4: Client Info & Payment */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">Seus Dados e Pagamento</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 pl-8">
              Enviaremos a confirmação e lembretes automáticos diretamente para o seu WhatsApp
            </p>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  E-mail (opcional para envio de calendário)
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Observações / Preferências (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Não gosto de navalha muito rente, barba comprida..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection & Summary */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Forma de Pagamento Preferida
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">PIX Instantâneo</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">Chave na barbearia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_credit')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'card_credit'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Cartão de Crédito</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">Pagar no local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_debit')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'card_debit'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Cartão de Débito</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">Pagar no local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Dinheiro em Espécie</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">Pagar no local</span>
                  </button>
                </div>
              </div>

              {/* PIX Quick Info */}
              {paymentMethod === 'pix' && profile.pixKey && (
                <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Chave PIX ({profile.pixKeyType})</span>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5 select-all">{profile.pixKey}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.pixKey || '');
                      alert('Chave PIX copiada!');
                    }}
                    className="text-xs font-semibold px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Serviço:</span>
                  <span className="text-white font-semibold">{selectedService?.name || 'Não selecionado'}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Barbeiro:</span>
                  <span className="text-white font-semibold">{selectedBarber?.name || 'Não selecionado'}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Data e Hora:</span>
                  <span className="text-white font-semibold">
                    {selectedTime ? `${formatDateBR(selectedDate)} às ${selectedTime}` : 'Selecione acima'}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="font-bold text-white uppercase">Valor Total</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {selectedService ? formatCurrency(selectedService.price) : 'R$ 0,00'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sem pagamento antecipado obrigatório. Confirmação instantânea!</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedService || !selectedBarber || !selectedTime}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Confirmar Meu Horário</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>

      </form>

      {/* Booking Success Modal */}
      {createdAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Horário Agendado com Sucesso!
              </h3>
              <p className="text-xs text-neutral-400">
                Sua cadeira já está reservada na <strong className="text-white">{profile.name}</strong>.
              </p>
            </div>

            {/* Ticket summary */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Cliente:</span>
                <span className="font-semibold text-white">{createdAppointment.customerName}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Serviço:</span>
                <span className="font-semibold text-white">{createdAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Profissional:</span>
                <span className="font-semibold text-amber-400">{createdAppointment.barberName}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Data:</span>
                <span className="font-semibold text-white">{formatDateBR(createdAppointment.date)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Horário:</span>
                <span className="font-semibold text-white">{createdAppointment.time}</span>
              </div>
              <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-800">
                <span>Valor:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(createdAppointment.servicePrice)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSendWhatsAppNotification(createdAppointment)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Enviar Confirmação pelo WhatsApp da Barbearia</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={createGoogleCalendarUrl(createdAppointment, profile)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Agenda</span>
                </a>

                <button
                  type="button"
                  onClick={() => downloadIcsFile(createdAppointment, profile)}
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreatedAppointment(null)}
              className="w-full py-2.5 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
            >
              Fechar
            </button>

          </div>
        </div>
      )}

      {/* Lookup Existing Appointments Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Consultar Meus Agendamentos</h3>
                  <p className="text-xs text-neutral-400">Digite seu WhatsApp para ver ou cancelar seus horários</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLookupModal(false);
                  setLookupResults(null);
                }}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <form onSubmit={handleLookupSearch} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Seu WhatsApp (ex: 11988887777)"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Buscar
                </button>
              </form>

              {lookupResults && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {lookupResults.length} resultado(s) encontrado(s):
                  </h4>

                  {lookupResults.length === 0 ? (
                    <p className="text-xs text-neutral-500 text-center py-6">
                      Nenhum agendamento encontrado para este número.
                    </p>
                  ) : (
                    lookupResults.map(apt => (
                      <div 
                        key={apt.id}
                        className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white">{apt.serviceName}</span>
                            <p className="text-[11px] text-neutral-400">com {apt.barberName}</p>
                          </div>
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
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span>{formatDateBR(apt.date)} às {apt.time}</span>
                          <span className="font-bold text-white">{formatCurrency(apt.servicePrice)}</span>
                        </div>

                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <div className="pt-2 border-t border-neutral-900 flex justify-end">
                            {cancellingId === apt.id ? (
                              <div className="w-full space-y-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Motivo do cancelamento (opcional)"
                                  value={cancelReasonInput}
                                  onChange={(e) => setCancelReasonInput(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCancellingId(null)}
                                    className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                                  >
                                    Voltar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmCancellation(apt)}
                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
                                  >
                                    Confirmar Cancelamento
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCancellingId(apt.id)}
                                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                              >
                                Cancelar Horário
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
