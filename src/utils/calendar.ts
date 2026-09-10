import { Appointment, BarberShopProfile } from '../types';

export const createGoogleCalendarUrl = (
  appointment: Appointment,
  profile: BarberShopProfile
): string => {
  // Parse date and time to ISO format for Google Calendar (YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS)
  // Let's assume duration is 45 mins if not specified
  const [year, month, day] = appointment.date.split('-');
  const [hours, minutes] = appointment.time.split(':');

  const startDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  // default 45 min duration
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatGCalDate = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const title = encodeURIComponent(`Corte/Barba na ${profile.name} - ${appointment.serviceName}`);
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  const details = encodeURIComponent(
    `Agendamento com o barbeiro ${appointment.barberName}.\nServiço: ${appointment.serviceName}\nValor: R$ ${appointment.servicePrice.toFixed(2)}\nCliente: ${appointment.customerName}\nContato barbearia: ${profile.phoneWhatsApp}\n\nAgendado via BarberPro.`
  );
  const location = encodeURIComponent(profile.address);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

export const downloadIcsFile = (appointment: Appointment, profile: BarberShopProfile): void => {
  const [year, month, day] = appointment.date.split('-');
  const [hours, minutes] = appointment.time.split(':');

  const startDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIcsDate = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberPro//Agendamento Barbearia//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apt-${appointment.id}-${Date.now()}@barberpro.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Corte/Barba - ${profile.name}`,
    `DESCRIPTION:Serviço: ${appointment.serviceName}\\nProfissional: ${appointment.barberName}\\nCliente: ${appointment.customerName}\\nValor: R$ ${appointment.servicePrice.toFixed(2)}`,
    `LOCATION:${profile.address.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete de corte na barbearia em 1 hora',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `agendamento-${appointment.date}-${appointment.time.replace(':', '')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
