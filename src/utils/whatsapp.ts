import { Appointment, BarberShopProfile, Receipt } from '../types';

export const cleanPhoneForWhatsApp = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('55')) {
    return digits;
  }
  // If Brazilian phone without country code (e.g. 11988887777 or 1188887777)
  if (digits.length >= 10 && digits.length <= 11) {
    return `55${digits}`;
  }
  return digits;
};

export const openWhatsApp = (phone: string, text: string): void => {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}` 
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getBookingConfirmationMessage = (
  appointment: Appointment,
  profile: BarberShopProfile,
  calendarUrl?: string
): string => {
  const dateFormatted = formatDateBR(appointment.date);
  const priceFormatted = formatCurrency(appointment.servicePrice);

  let msg = `💈 *${profile.name}* - Agendamento Confirmado! 💈\n\n`;
  msg += `Olá, *${appointment.customerName}*!\n`;
  msg += `Seu agendamento foi registrado com sucesso em nossa barbearia.\n\n`;
  msg += `✂️ *Serviço:* ${appointment.serviceName}\n`;
  msg += `👤 *Profissional:* ${appointment.barberName}\n`;
  msg += `📅 *Data:* ${dateFormatted}\n`;
  msg += `⏰ *Horário:* ${appointment.time}\n`;
  msg += `💰 *Valor:* ${priceFormatted}\n`;
  msg += `📍 *Endereço:* ${profile.address}\n\n`;
  
  if (appointment.notes) {
    msg += `📝 *Obs:* ${appointment.notes}\n\n`;
  }

  if (calendarUrl) {
    msg += `📅 *Adicionar ao Google Calendar:*\n${calendarUrl}\n\n`;
  }

  msg += `⚠️ *Aviso de comparecimento:*\n`;
  msg += `Por favor, chegue com 5 minutos de antecedência.\n`;
  msg += `Caso precise cancelar ou remarcar, nos avise com antecedência por aqui.\n\n`;
  msg += `Aguardamos você com o melhor atendimento! 🥃✂️`;

  return msg;
};

export const getCancellationMessage = (
  appointment: Appointment,
  profile: BarberShopProfile,
  reason: string,
  cancelledBy: 'client' | 'barber'
): string => {
  const dateFormatted = formatDateBR(appointment.date);

  let msg = `⚠️ *AVISO DE CANCELAMENTO* - ${profile.name} ⚠️\n\n`;
  
  if (cancelledBy === 'client') {
    msg += `Olá, equipe da *${profile.name}*!\n`;
    msg += `Eu (*${appointment.customerName}*) preciso cancelar meu agendamento:\n\n`;
  } else {
    msg += `Olá, *${appointment.customerName}*!\n`;
    msg += `Informamos que o seu agendamento na *${profile.name}* precisou ser cancelado:\n\n`;
  }

  msg += `✂️ *Serviço:* ${appointment.serviceName}\n`;
  msg += `👤 *Barbeiro:* ${appointment.barberName}\n`;
  msg += `📅 *Data:* ${dateFormatted} às ${appointment.time}\n`;
  
  if (reason) {
    msg += `📋 *Motivo informado:* ${reason}\n\n`;
  } else {
    msg += `\n`;
  }

  if (cancelledBy === 'barber') {
    msg += `Pedimos sinceras desculpas pelo transtorno. Fique à vontade para escolher um novo horário no nosso link de agendamento online!\n`;
  } else {
    msg += `Agradecemos a compreensão e em breve realizarei um novo agendamento.\n`;
  }

  return msg;
};

export const getReminderMessage = (
  appointment: Appointment,
  profile: BarberShopProfile
): string => {
  const dateFormatted = formatDateBR(appointment.date);

  let msg = `🔔 *LEMBRETE DE HORÁRIO* - ${profile.name} 🔔\n\n`;
  msg += `Fala, *${appointment.customerName}*! Tudo bem?\n\n`;
  msg += `Passando para lembrar do seu horário hoje:\n`;
  msg += `✂️ *Serviço:* ${appointment.serviceName}\n`;
  msg += `👤 *Com:* ${appointment.barberName}\n`;
  msg += `📅 *Data:* ${dateFormatted}\n`;
  msg += `⏰ *Horário:* ${appointment.time}\n`;
  msg += `📍 *Local:* ${profile.address}\n\n`;
  msg += `Sua cadeira já está reservada! Caso haja algum imprevisto, responda esta mensagem imediatamente.\n\n`;
  msg += `Até logo! 💈`;

  return msg;
};

export const getReceiptMessage = (receipt: Receipt): string => {
  const formattedPrice = formatCurrency(receipt.amount);
  const paymentLabels: Record<string, string> = {
    pix: 'PIX Instantâneo',
    card_credit: 'Cartão de Crédito',
    card_debit: 'Cartão de Débito',
    cash: 'Dinheiro'
  };

  let msg = `🧾 *RECIBO DIGITAL DE PAGAMENTO* 🧾\n`;
  msg += `*${receipt.shopName}*\n`;
  msg += `📍 ${receipt.shopAddress}\n`;
  msg += `--------------------------------\n`;
  msg += `Nº Recibo: *${receipt.receiptNumber}*\n`;
  msg += `Data/Hora: ${new Date(receipt.issuedAt).toLocaleString('pt-BR')}\n`;
  msg += `Código de Autenticação: ${receipt.authCode}\n`;
  msg += `--------------------------------\n`;
  msg += `Cliente: *${receipt.customerName}*\n`;
  msg += `Profissional: ${receipt.barberName}\n`;
  msg += `Serviço: ${receipt.serviceName}\n`;
  msg += `Forma de Pagto: ${paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}\n`;
  msg += `--------------------------------\n`;
  msg += `*TOTAL PAGO: ${formattedPrice}*\n`;
  msg += `Status: PAGO & CONFIRMADO ✅\n`;
  msg += `--------------------------------\n`;
  msg += `Agradecemos pela preferência! Volte sempre. 💈`;

  return msg;
};
