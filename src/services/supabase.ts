import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, Barber, BarberShopProfile, InAppNotification, Receipt, Service, SupabaseConfig } from '../types';

const STORAGE_KEYS = {
  SUPABASE_URL: 'barberpro_supabase_url',
  SUPABASE_KEY: 'barberpro_supabase_key',
  PROFILE: 'barberpro_profile',
  SERVICES: 'barberpro_services',
  BARBERS: 'barberpro_barbers',
  APPOINTMENTS: 'barberpro_appointments',
  RECEIPTS: 'barberpro_receipts',
  NOTIFICATIONS: 'barberpro_notifications'
};

const DEFAULT_URL = 'https://mchwtlupmwpkluhclgya.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHd0bHVwbXdwa2x1aGNsZ3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM2Mzg4NiwiZXhwIjoyMTAzOTM5ODg2fQ.YlesVh2ByD9JbSxNTOQsSKwa-IrqxqPJv2EAy8of1_E';

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;
  
  const savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || envUrl;
  const savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || envKey;

  const isConfigured = Boolean(savedUrl && savedKey && savedUrl.startsWith('http'));

  return {
    url: savedUrl,
    anonKey: savedKey,
    connected: isConfigured,
    lastSync: localStorage.getItem('barberpro_last_sync') || undefined
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, anonKey.trim());
};

export const getSupabaseClient = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const config = getSupabaseConfig();
  const url = customUrl || config.url;
  const key = customKey || config.anonKey;
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }
  try {
    return createClient(url, key);
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

export const syncAppointmentsWithSupabase = async (
  appointments: Appointment[],
  config?: SupabaseConfig
): Promise<{ success: boolean; message: string }> => {
  try {
    const client = getSupabaseClient(config?.url, config?.anonKey);
    if (!client) {
      return { success: false, message: 'Supabase não configurado.' };
    }
    // Upsert appointments
    const payload = appointments.map(a => ({
      id: a.id,
      shop_id: a.shopId,
      customer_name: a.customerName,
      customer_phone: a.customerPhone,
      customer_email: a.customerEmail,
      barber_id: a.barberId,
      barber_name: a.barberName,
      service_id: a.serviceId,
      service_name: a.serviceName,
      service_price: a.servicePrice,
      date: a.date,
      time: a.time,
      status: a.status,
      payment_status: a.paymentStatus,
      payment_method: a.paymentMethod,
      notes: a.notes,
      receipt_id: a.receiptId
    }));
    const { error } = await client.from('appointments').upsert(payload);
    if (error) throw error;
    return { success: true, message: 'Sincronizado com o Supabase com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro ao sincronizar com Supabase' };
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return { success: false, message: 'URL do Supabase inválida. Deve começar com https://' };
    }
    const client = createClient(url, key);
    // Simple ping to check if client can reach Supabase
    const { error } = await client.from('barbershops').select('id').limit(1);
    
    // If auth error
    if (error && error.code !== '42P01' && error.message?.includes('JWT')) {
      return { success: false, message: `Erro de autenticação na chave: ${error.message}` };
    }

    return { 
      success: true, 
      message: error?.code === '42P01' 
        ? 'Conectado ao Supabase! As tabelas ainda não existem. Lembre-se de rodar o script SQL no SQL Editor.' 
        : 'Conexão com Supabase verificada e ativa com sucesso!' 
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Falha ao conectar com o Supabase' };
  }
};

// SQL Schema script for user to copy & paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- BARBERPRO / APPBARBEARIA - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. EXTENSÕES ÚTEIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE FILIAIS / UNIDADES (BARBERSHOPS)
CREATE TABLE IF NOT EXISTS public.barbershops (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  name TEXT NOT NULL,
  slogan TEXT,
  logo_url TEXT,
  cover_url TEXT,
  primary_color TEXT DEFAULT '#f59e0b',
  accent_color TEXT DEFAULT '#d97706',
  phone_whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  opening_time TEXT DEFAULT '09:00',
  closing_time TEXT DEFAULT '20:00',
  lunch_break_enabled BOOLEAN DEFAULT TRUE,
  lunch_start TEXT DEFAULT '12:00',
  lunch_end TEXT DEFAULT '13:00',
  slot_interval_minutes INT DEFAULT 30,
  days_open INT[] DEFAULT ARRAY[1,2,3,4,5,6],
  pix_key TEXT,
  pix_key_type TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE ADMINISTRADORES E SUPERUSUÁRIO (ADMINS)
CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'superuser' | 'admin' | 'manager'
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE BARBEIROS / PROFISSIONAIS (BARBERS)
CREATE TABLE IF NOT EXISTS public.barbers (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE CASCADE,
  admin_id TEXT,
  name TEXT NOT NULL,
  specialty TEXT,
  photo_url TEXT,
  bio TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE SERVIÇOS (SERVICES)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL,
  category TEXT DEFAULT 'cabelo',
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE AGENDAMENTOS (APPOINTMENTS)
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  barber_id TEXT NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  barber_name TEXT NOT NULL,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  payment_method TEXT, -- 'pix', 'card_credit', 'card_debit', 'cash'
  notes TEXT,
  receipt_id TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE RECIBOS DIGITAIS (RECEIPTS)
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  appointment_id TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  shop_phone TEXT NOT NULL,
  auth_code TEXT NOT NULL
);

-- 8. TABELA DE NOTIFICAÇÕES (NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  shop_id TEXT REFERENCES public.barbershops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'new_booking', -- 'new_booking', 'cancellation', 'reminder', 'payment', 'sync'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  appointment_id TEXT,
  customer_name TEXT
);

-- 9. ÍNDICES PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_barbers_shop ON public.barbers(shop_id);
CREATE INDEX IF NOT EXISTS idx_services_shop ON public.services(shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_shop ON public.appointments(shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_admins_username ON public.admins(username);

-- 10. ROW LEVEL SECURITY (RLS) E POLÍTICAS PÚBLICAS PARA O APPLET
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso público barbershops" ON public.barbershops;
CREATE POLICY "Acesso público barbershops" ON public.barbershops FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público admins" ON public.admins;
CREATE POLICY "Acesso público admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público barbers" ON public.barbers;
CREATE POLICY "Acesso público barbers" ON public.barbers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público services" ON public.services;
CREATE POLICY "Acesso público services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público appointments" ON public.appointments;
CREATE POLICY "Acesso público appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público receipts" ON public.receipts;
CREATE POLICY "Acesso público receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público notifications" ON public.notifications;
CREATE POLICY "Acesso público notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 11. DADOS INICIAIS (SEED OPCIONAL)
-- Insere a Filial Matriz inicial se ainda não existir
INSERT INTO public.barbershops (
  id, name, slogan, logo_url, cover_url, primary_color, accent_color, phone_whatsapp, address, opening_time, closing_time, slot_interval_minutes, pix_key, pix_key_type
) VALUES (
  'shop_matriz',
  'BarberPro Matriz',
  'Tradição, Estilo e Precisão para Cavalheiros',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1200',
  '#f59e0b',
  '#d97706',
  '5511999998888',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  '09:00',
  '20:00',
  30,
  'contato@barberpro.com.br',
  'email'
) ON CONFLICT (id) DO NOTHING;

-- Insere o Superusuário inicial
INSERT INTO public.admins (
  id, shop_id, name, username, password_hash, role, phone, active
) VALUES (
  'admin_super',
  'shop_matriz',
  'Superusuário BarberPro',
  'superuser',
  'super123',
  'superuser',
  '5511999998888',
  true
) ON CONFLICT (id) DO NOTHING;
`;

// Persistence helpers with localStorage and Supabase Sync
export const loadDataFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

export const saveDataToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};
