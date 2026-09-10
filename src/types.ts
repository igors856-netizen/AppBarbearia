export type ActiveView = 'client' | 'dashboard' | 'finance' | 'services' | 'admins';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'manager';
  barberId?: string; // ID of the barber profile tied to this admin's personal schedule
  createdAt: string;
  lastLogin?: string;
}

export interface BarberShopProfile {
  id: string;
  name: string;
  slogan: string;
  logoUrl: string;
  coverUrl: string;
  primaryColor: string; // e.g. '#f59e0b'
  accentColor: string; // e.g. '#d97706'
  phoneWhatsApp: string; // e.g. '11999998888'
  address: string;
  openingTime: string; // '08:00'
  closingTime: string; // '20:00'
  lunchBreakEnabled?: boolean;
  lunchStart?: string; // '12:00'
  lunchEnd?: string;   // '13:00'
  slotIntervalMinutes: number; // 30
  daysOpen: number[]; // [1, 2, 3, 4, 5, 6] (1=Monday... 6=Saturday)
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: 'cabelo' | 'barba' | 'combo' | 'estetica';
  imageUrl?: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  bio: string;
  phone: string;
  active: boolean;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'pix' | 'card_credit' | 'card_debit' | 'cash';

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  receiptId?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'client' | 'barber';
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  appointmentId: string;
  issuedAt: string;
  customerName: string;
  customerPhone: string;
  barberName: string;
  serviceName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  authCode: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_booking' | 'cancellation' | 'reminder' | 'completion' | 'sync';
  timestamp: string;
  read: boolean;
  appointmentId?: string;
  customerName?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSync?: string;
}
