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

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
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

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith('http')) {
    return null;
  }
  try {
    return createClient(config.url, config.anonKey);
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return { success: false, message: 'URL do Supabase inválida. Deve começar com https://' };
    }
    const client = createClient(url, key);
    // Simple ping to check if client can reach Supabase
    const { error } = await client.from('barbershop_profile').select('id').limit(1);
    
    // Even if table does not exist yet (code 42P01 in Postgres), it confirms network auth reached Supabase!
    if (error && error.code !== '42P01' && error.message?.includes('JWT')) {
      return { success: false, message: `Erro de autenticação na chave Anon: ${error.message}` };
    }

    return { 
      success: true, 
      message: error?.code === '42P01' 
        ? 'Conectado ao Supabase! Lembre-se de rodar o script SQL para criar as tabelas.' 
        : 'Conexão com Supabase verificada com sucesso!' 
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Falha ao conectar com o Supabase' };
  }
};

// SQL Schema script for user to copy & paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- BARBERPRO - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS NO SUPABASE
-- Execute este script no editor SQL do seu painel Supabase (SQL Editor)
-- ==============================================================================

-- 1. Tabela de Perfil da Barbearia
CREATE TABLE IF NOT EXISTS public.barbershop_profile (
  id TEXT PRIMARY KEY,
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
  slot_interval_minutes INT DEFAULT 30,
  days_open INT[] DEFAULT ARRAY[1,2,3,4,5,6],
  pix_key TEXT,
  pix_key_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Barbeiros / Profissionais
CREATE TABLE IF NOT EXISTS public.barbers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  photo_url TEXT,
  bio TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL,
  category TEXT DEFAULT 'cabelo',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  barber_id TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid
  payment_method TEXT, -- pix, card_credit, card_debit, cash
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  receipt_id TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by TEXT
);

-- 5. Tabela de Recibos Digitais
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
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

-- Habilitar Row Level Security (RLS) permissivo para o applet
ALTER TABLE public.barbershop_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público leitura e escrita" ON public.barbershop_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público leitura e escrita" ON public.barbers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público leitura e escrita" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público leitura e escrita" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público leitura e escrita" ON public.receipts FOR ALL USING (true) WITH CHECK (true);
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
