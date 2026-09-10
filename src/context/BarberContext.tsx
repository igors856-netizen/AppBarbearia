import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  BarberShopProfile, 
  Service, 
  Barber, 
  Appointment, 
  Receipt, 
  InAppNotification, 
  SupabaseConfig, 
  PaymentMethod,
  AdminUser,
  ActiveView
} from '../types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SERVICES, 
  DEFAULT_BARBERS, 
  DEFAULT_APPOINTMENTS, 
  DEFAULT_RECEIPTS,
  DEFAULT_ADMINS
} from '../data/defaultData';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabaseClient, 
  loadDataFromStorage, 
  saveDataToStorage 
} from '../services/supabase';

interface BarberContextType {
  profile: BarberShopProfile;
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  receipts: Receipt[];
  notifications: InAppNotification[];
  supabaseConfig: SupabaseConfig;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  
  // Admin & Auth
  admins: AdminUser[];
  currentAdmin: AdminUser | null;
  currentAdminBarber: Barber | undefined;
  loginAdmin: (username: string, password: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  addAdmin: (data: { 
    name: string; 
    username: string; 
    password: string; 
    role?: 'admin' | 'manager';
    barberId?: string;
    createBarberProfile?: boolean;
    specialty?: string;
  }) => { success: boolean; message: string };
  deleteAdmin: (id: string) => { success: boolean; message: string };
  updateAdminPassword: (id: string, newPass: string) => { success: boolean; message: string };
  updateAdminProfile: (id: string, data: { name?: string; username?: string; password?: string }) => { success: boolean; message: string };
  updateAdminBarberLink: (adminId: string, barberId: string) => void;

  // Actions
  updateProfile: (updated: Partial<BarberShopProfile>) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Appointment;
  confirmAppointment: (id: string) => void;
  completeAppointment: (id: string, paymentMethod: PaymentMethod) => Receipt;
  cancelAppointment: (id: string, reason: string, cancelledBy: 'client' | 'barber') => void;
  deleteAppointment: (id: string) => void;
  
  // Service management
  addService: (srv: Omit<Service, 'id'>) => void;
  updateService: (srv: Service) => void;
  deleteService: (id: string) => void;

  // Barber management
  addBarber: (b: Omit<Barber, 'id'>) => void;
  updateBarber: (b: Barber) => void;

  // Notifications
  addNotification: (title: string, message: string, type: InAppNotification['type'], appointmentId?: string, customerName?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Supabase
  updateSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
}

const BarberContext = createContext<BarberContextType | null>(null);

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<BarberShopProfile>(() => 
    loadDataFromStorage('barberpro_profile', DEFAULT_PROFILE)
  );

  const [services, setServices] = useState<Service[]>(() => 
    loadDataFromStorage('barberpro_services', DEFAULT_SERVICES)
  );

  const [barbers, setBarbers] = useState<Barber[]>(() => {
    const stored = loadDataFromStorage<Barber[]>('barberpro_barbers', DEFAULT_BARBERS);
    let list = Array.isArray(stored) && stored.length > 0 ? [...stored] : [...DEFAULT_BARBERS];
    // Guarantee barber_igor and barber_igor2 exist
    DEFAULT_BARBERS.forEach(db => {
      if (!list.some(b => b.id === db.id)) {
        list.push(db);
      }
    });
    return list;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = loadDataFromStorage<Appointment[]>('barberpro_appointments', DEFAULT_APPOINTMENTS);
    let list = Array.isArray(stored) && stored.length > 0 ? [...stored] : [...DEFAULT_APPOINTMENTS];
    // Guarantee Igor and Igor2 have sample appointments
    const hasIgorApt = list.some(a => a.barberId === 'barber_igor');
    const hasIgor2Apt = list.some(a => a.barberId === 'barber_igor2');
    if (!hasIgorApt) {
      const igorApts = DEFAULT_APPOINTMENTS.filter(a => a.barberId === 'barber_igor');
      list = [...igorApts, ...list];
    }
    if (!hasIgor2Apt) {
      const igor2Apts = DEFAULT_APPOINTMENTS.filter(a => a.barberId === 'barber_igor2');
      list = [...igor2Apts, ...list];
    }
    return list;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const stored = loadDataFromStorage<Receipt[]>('barberpro_receipts', DEFAULT_RECEIPTS);
    let list = Array.isArray(stored) && stored.length > 0 ? [...stored] : [...DEFAULT_RECEIPTS];
    DEFAULT_RECEIPTS.forEach(dr => {
      if (!list.some(r => r.id === dr.id)) {
        list.push(dr);
      }
    });
    return list;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => 
    loadDataFromStorage('barberpro_notifications', [
      {
        id: 'notif_init',
        title: 'Sistema BarberPro Ativo',
        message: 'Bem-vindo! O sistema de agendamentos, WhatsApp e Google Calendar está pronto para uso.',
        type: 'sync',
        timestamp: new Date().toISOString(),
        read: false
      }
    ])
  );

  const [supabaseConfig, setConfig] = useState<SupabaseConfig>(getSupabaseConfig);
  
  // Administrators list and active session
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const stored = loadDataFromStorage<AdminUser[]>('barberpro_admins', DEFAULT_ADMINS);
    let list = Array.isArray(stored) && stored.length > 0 ? [...stored] : [...DEFAULT_ADMINS];
    
    // Guarantee superuser (superuser / 123)
    const superIdx = list.findIndex(a => a.username.toLowerCase() === 'superuser');
    if (superIdx === -1) {
      list.unshift({
        id: 'adm_superuser',
        name: 'Superusuário',
        username: 'superuser',
        password: '123',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z'
      });
    } else {
      list[superIdx] = { ...list[superIdx], password: '123' };
    }

    // Guarantee required default credentials (igor / 123456 and igor2 / 123456789)
    if (!list.some(a => a.username.toLowerCase() === 'igor')) {
      const igorDef = DEFAULT_ADMINS.find(a => a.username === 'igor');
      if (igorDef) list.push(igorDef);
    }
    if (!list.some(a => a.username.toLowerCase() === 'igor2')) {
      const igor2Def = DEFAULT_ADMINS.find(a => a.username === 'igor2');
      if (igor2Def) list.push(igor2Def);
    }
    // Update barberId if not linked
    list = list.map(a => {
      if (a.username.toLowerCase() === 'igor' && !a.barberId) {
        return { ...a, barberId: 'barber_igor' };
      }
      if (a.username.toLowerCase() === 'igor2' && !a.barberId) {
        return { ...a, barberId: 'barber_igor2' };
      }
      return a;
    });
    return list;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    return loadDataFromStorage<AdminUser | null>('barberpro_current_admin', null);
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const admin = loadDataFromStorage<AdminUser | null>('barberpro_current_admin', null);
    return admin ? 'dashboard' : 'client';
  });

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Sync state to local storage on changes
  useEffect(() => {
    saveDataToStorage('barberpro_admins', admins);
  }, [admins]);

  useEffect(() => {
    saveDataToStorage('barberpro_current_admin', currentAdmin);
  }, [currentAdmin]);

  useEffect(() => {
    saveDataToStorage('barberpro_profile', profile);
  }, [profile]);

  useEffect(() => {
    saveDataToStorage('barberpro_services', services);
  }, [services]);

  useEffect(() => {
    saveDataToStorage('barberpro_barbers', barbers);
  }, [barbers]);

  useEffect(() => {
    saveDataToStorage('barberpro_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    saveDataToStorage('barberpro_receipts', receipts);
  }, [receipts]);

  useEffect(() => {
    saveDataToStorage('barberpro_notifications', notifications);
  }, [notifications]);

  // Apply theme styling dynamically to CSS root variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--shop-primary', profile.primaryColor || '#f59e0b');
    root.style.setProperty('--shop-accent', profile.accentColor || '#d97706');
  }, [profile.primaryColor, profile.accentColor]);

  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: InAppNotification['type'], 
    appointmentId?: string, 
    customerName?: string
  ) => {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      appointmentId,
      customerName
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Optional subtle web audio chime for real-time notification experience
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, []);

  const updateProfile = useCallback((updated: Partial<BarberShopProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updated };
      return next;
    });
    addNotification('Perfil Atualizado', 'As preferências da barbearia foram salvas.', 'sync');
  }, [addNotification]);

  const addAppointment = useCallback((
    aptData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'paymentStatus'>
  ): Appointment => {
    const newAppointment: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      paymentStatus: 'pending'
    };

    setAppointments(prev => [newAppointment, ...prev]);

    addNotification(
      'Novo Agendamento Recebido! 💈',
      `${newAppointment.customerName} agendou ${newAppointment.serviceName} com ${newAppointment.barberName} para ${newAppointment.date} às ${newAppointment.time}.`,
      'new_booking',
      newAppointment.id,
      newAppointment.customerName
    );

    // Sync to Supabase if connected
    const client = getSupabaseClient();
    if (client) {
      client.from('appointments').insert({
        id: newAppointment.id,
        customer_name: newAppointment.customerName,
        customer_phone: newAppointment.customerPhone,
        customer_email: newAppointment.customerEmail,
        barber_id: newAppointment.barberId,
        barber_name: newAppointment.barberName,
        service_id: newAppointment.serviceId,
        service_name: newAppointment.serviceName,
        service_price: newAppointment.servicePrice,
        date: newAppointment.date,
        time: newAppointment.time,
        status: newAppointment.status,
        payment_status: newAppointment.paymentStatus,
        notes: newAppointment.notes,
        created_at: newAppointment.createdAt
      }).then(({ error }) => {
        if (error) console.error('Supabase appointment insert error:', error);
      });
    }

    return newAppointment;
  }, [addNotification]);

  const confirmAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'confirmed' };
      }
      return a;
    }));

    const apt = appointments.find(a => a.id === id);
    if (apt) {
      addNotification(
        'Agendamento Confirmado',
        `Horário de ${apt.customerName} às ${apt.time} foi confirmado pelo barbeiro.`,
        'sync',
        id,
        apt.customerName
      );
    }
  }, [appointments, addNotification]);

  const completeAppointment = useCallback((id: string, paymentMethod: PaymentMethod): Receipt => {
    const apt = appointments.find(a => a.id === id);
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;
    const authCode = `AUT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newReceipt: Receipt = {
      id: `rcpt_${Date.now()}`,
      receiptNumber,
      appointmentId: id,
      issuedAt: new Date().toISOString(),
      customerName: apt?.customerName || 'Cliente',
      customerPhone: apt?.customerPhone || '',
      barberName: apt?.barberName || 'Barbeiro',
      serviceName: apt?.serviceName || 'Serviço Barbearia',
      amount: apt?.servicePrice || 0,
      paymentMethod,
      shopName: profile.name,
      shopAddress: profile.address,
      shopPhone: profile.phoneWhatsApp,
      authCode
    };

    // Update appointment
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod,
          receiptId: newReceipt.id
        };
      }
      return a;
    }));

    // Add receipt
    setReceipts(prev => [newReceipt, ...prev]);

    // Notification
    addNotification(
      'Atendimento Concluído & Recibo Emitido! 🧾',
      `Atendimento de ${newReceipt.customerName} finalizado. Recibo ${newReceipt.receiptNumber} gerado no valor de R$ ${newReceipt.amount.toFixed(2)}.`,
      'completion',
      id,
      newReceipt.customerName
    );

    // Sync to Supabase
    const client = getSupabaseClient();
    if (client) {
      client.from('appointments').update({
        status: 'completed',
        payment_status: 'paid',
        payment_method: paymentMethod,
        receipt_id: newReceipt.id
      }).eq('id', id).then();

      client.from('receipts').insert({
        id: newReceipt.id,
        receipt_number: newReceipt.receiptNumber,
        appointment_id: id,
        issued_at: newReceipt.issuedAt,
        customer_name: newReceipt.customerName,
        customer_phone: newReceipt.customerPhone,
        barber_name: newReceipt.barberName,
        service_name: newReceipt.serviceName,
        amount: newReceipt.amount,
        payment_method: newReceipt.paymentMethod,
        shop_name: newReceipt.shopName,
        shop_address: newReceipt.shopAddress,
        shop_phone: newReceipt.shopPhone,
        auth_code: newReceipt.authCode
      }).then();
    }

    return newReceipt;
  }, [appointments, receipts.length, profile, addNotification]);

  const cancelAppointment = useCallback((id: string, reason: string, cancelledBy: 'client' | 'barber') => {
    const apt = appointments.find(a => a.id === id);

    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          cancelledBy
        };
      }
      return a;
    }));

    addNotification(
      `Agendamento Cancelado (${cancelledBy === 'client' ? 'Pelo Cliente' : 'Pela Barbearia'}) ⚠️`,
      `${apt?.customerName || 'Cliente'} cancelou o horário de ${apt?.date} às ${apt?.time}. Motivo: ${reason || 'Não informado'}.`,
      'cancellation',
      id,
      apt?.customerName
    );

    const client = getSupabaseClient();
    if (client) {
      client.from('appointments').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancelled_by: cancelledBy
      }).eq('id', id).then();
    }
  }, [appointments, addNotification]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('appointments').delete().eq('id', id).then();
    }
  }, []);

  const addService = useCallback((srv: Omit<Service, 'id'>) => {
    const newSrv: Service = {
      ...srv,
      id: `srv_${Date.now()}`
    };
    setServices(prev => [...prev, newSrv]);
  }, []);

  const updateService = useCallback((srv: Service) => {
    setServices(prev => prev.map(s => s.id === s.id ? srv : s));
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  }, []);

  const addBarber = useCallback((b: Omit<Barber, 'id'>) => {
    const newB: Barber = {
      ...b,
      id: `barber_${Date.now()}`
    };
    setBarbers(prev => [...prev, newB]);
  }, []);

  const updateBarber = useCallback((b: Barber) => {
    setBarbers(prev => prev.map(item => item.id === b.id ? b : item));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSupabaseConfig = useCallback(async (url: string, key: string): Promise<boolean> => {
    saveSupabaseConfig(url, key);
    const newConfig = getSupabaseConfig();
    setConfig(newConfig);
    return newConfig.connected;
  }, []);

  const syncWithSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não está configurado com URL e chave válidas.' };
    }

    try {
      // 1. Fetch appointments from Supabase
      const { data: dbApts, error: aptError } = await client.from('appointments').select('*');
      if (aptError) {
        return { success: false, message: `Erro ao consultar appointments: ${aptError.message}` };
      }

      if (dbApts && dbApts.length > 0) {
        // Map database schema to frontend
        const mappedApts: Appointment[] = dbApts.map(row => ({
          id: row.id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          customerEmail: row.customer_email,
          barberId: row.barber_id,
          barberName: row.barber_name,
          serviceId: row.service_id,
          serviceName: row.service_name,
          servicePrice: Number(row.service_price),
          date: row.date,
          time: row.time,
          status: row.status,
          paymentStatus: row.payment_status,
          paymentMethod: row.payment_method,
          notes: row.notes,
          createdAt: row.created_at,
          receiptId: row.receipt_id,
          cancelledAt: row.cancelled_at,
          cancellationReason: row.cancellation_reason,
          cancelledBy: row.cancelled_by
        }));
        setAppointments(mappedApts);
      } else {
        // If Supabase table is empty, push local appointments to seed it!
        for (const apt of appointments) {
          await client.from('appointments').upsert({
            id: apt.id,
            customer_name: apt.customerName,
            customer_phone: apt.customerPhone,
            customer_email: apt.customerEmail,
            barber_id: apt.barberId,
            barber_name: apt.barberName,
            service_id: apt.serviceId,
            service_name: apt.serviceName,
            service_price: apt.servicePrice,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            payment_status: apt.paymentStatus,
            payment_method: apt.paymentMethod,
            notes: apt.notes,
            created_at: apt.createdAt,
            receipt_id: apt.receiptId
          });
        }
      }

      const syncTimestamp = new Date().toLocaleTimeString('pt-BR');
      localStorage.setItem('barberpro_last_sync', syncTimestamp);
      setConfig(prev => ({ ...prev, lastSync: syncTimestamp }));

      addNotification('Sincronização Concluída', 'Dados sincronizados com o banco de dados Supabase.', 'sync');
      return { success: true, message: 'Dados sincronizados com o Supabase com sucesso!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro durante a sincronização.' };
    }
  }, [appointments, addNotification]);

  // ================= ADMIN AUTH & MANAGEMENT =================
  const loginAdmin = useCallback((username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = admins.find(
      a => a.username.toLowerCase() === cleanUser && a.password === cleanPass
    );

    if (found) {
      const updatedUser: AdminUser = {
        ...found,
        lastLogin: new Date().toISOString()
      };
      setCurrentAdmin(updatedUser);
      setAdmins(prev => prev.map(a => a.id === found.id ? updatedUser : a));
      addNotification(
        'Acesso Autorizado',
        `Bem-vindo(a), ${found.name}! Painel administrativo liberado.`,
        'sync'
      );
      return { success: true, message: 'Login realizado com sucesso!' };
    } else {
      return { success: false, message: 'Usuário ou senha incorretos.' };
    }
  }, [admins, addNotification]);

  const logoutAdmin = useCallback(() => {
    setCurrentAdmin(null);
    saveDataToStorage('barberpro_current_admin', null);
    setActiveView('client');
    addNotification(
      'Sessão Finalizada',
      'Você saiu da área administrativa com segurança.',
      'sync'
    );
  }, [addNotification]);

  const currentAdminBarber = React.useMemo(() => {
    if (!currentAdmin) return undefined;
    if (currentAdmin.barberId) {
      const match = barbers.find(b => b.id === currentAdmin.barberId);
      if (match) return match;
    }
    return barbers.find(b => b.name.toLowerCase() === currentAdmin.name.toLowerCase());
  }, [currentAdmin, barbers]);

  const updateAdminBarberLink = useCallback((adminId: string, barberId: string) => {
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, barberId } : a));
    if (currentAdmin?.id === adminId) {
      setCurrentAdmin(prev => prev ? { ...prev, barberId } : null);
    }
    addNotification('Agenda Atualizada', 'O vínculo de agenda do administrador foi atualizado com sucesso.', 'sync');
  }, [currentAdmin, addNotification]);

  const addAdmin = useCallback((data: { 
    name: string; 
    username: string; 
    password: string; 
    role?: 'admin' | 'manager';
    barberId?: string;
    createBarberProfile?: boolean;
    specialty?: string;
  }) => {
    const cleanUser = data.username.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanPass = data.password.trim();

    if (!cleanUser || !cleanName || !cleanPass) {
      return { success: false, message: 'Preencha todos os campos obrigatórios.' };
    }

    if (admins.some(a => a.username.toLowerCase() === cleanUser)) {
      return { success: false, message: `O login "${cleanUser}" já está em uso.` };
    }

    if (cleanPass.length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' };
    }

    let linkedBarberId = data.barberId;

    if (data.createBarberProfile !== false && !linkedBarberId) {
      // Automatically create a barber profile for this admin so they get their own schedule!
      const newBarberId = `barber_${Date.now()}`;
      const newBarber: Barber = {
        id: newBarberId,
        name: cleanName,
        specialty: data.specialty || 'Barbeiro Profissional & Visagismo',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        bio: `Administrador e Barbeiro. Atendimentos personalizados.`,
        phone: profile.phoneWhatsApp || '11999998888',
        active: true
      };
      setBarbers(prev => [...prev, newBarber]);
      linkedBarberId = newBarberId;
    }

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      role: data.role || 'admin',
      barberId: linkedBarberId,
      createdAt: new Date().toISOString()
    };

    setAdmins(prev => [...prev, newAdmin]);
    addNotification(
      'Novo Administrador Cadastrado',
      `O usuário @${cleanUser} (${cleanName}) agora possui acesso ao painel com sua agenda individual configurada.`,
      'sync'
    );
    return { success: true, message: 'Novo administrador cadastrado com sucesso!' };
  }, [admins, profile.phoneWhatsApp, addNotification]);

  const deleteAdmin = useCallback((id: string) => {
    if (admins.length <= 1) {
      return { success: false, message: 'Não é possível excluir o único administrador do sistema.' };
    }
    const target = admins.find(a => a.id === id);
    if (!target) {
      return { success: false, message: 'Administrador não encontrado.' };
    }

    setAdmins(prev => prev.filter(a => a.id !== id));
    if (currentAdmin?.id === id) {
      logoutAdmin();
    }
    addNotification(
      'Administrador Excluído',
      `O acesso de @${target.username} foi removido com sucesso.`,
      'cancellation'
    );
    return { success: true, message: 'Administrador removido com sucesso.' };
  }, [admins, currentAdmin, logoutAdmin, addNotification]);

  const updateAdminPassword = useCallback((id: string, newPass: string) => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, password: newPass.trim() } : a));
    if (currentAdmin?.id === id) {
      setCurrentAdmin(prev => prev ? { ...prev, password: newPass.trim() } : null);
    }
    return { success: true, message: 'Senha atualizada com sucesso!' };
  }, [currentAdmin]);

  const updateAdminProfile = useCallback((id: string, data: { name?: string; username?: string; password?: string }) => {
    const target = admins.find(a => a.id === id);
    if (!target) {
      return { success: false, message: 'Administrador não encontrado.' };
    }

    const cleanUser = data.username ? data.username.trim().toLowerCase() : target.username;
    const cleanName = data.name ? data.name.trim() : target.name;
    const cleanPass = data.password && data.password.trim() ? data.password.trim() : target.password;

    if (!cleanUser || !cleanName) {
      return { success: false, message: 'Nome e usuário são campos obrigatórios.' };
    }

    if (cleanPass && cleanPass.length < 3) {
      return { success: false, message: 'A senha deve conter no mínimo 3 caracteres.' };
    }

    if (cleanUser !== target.username && admins.some(a => a.id !== id && a.username.toLowerCase() === cleanUser)) {
      return { success: false, message: `O nome de usuário @${cleanUser} já está em uso.` };
    }

    const updatedUser: AdminUser = {
      ...target,
      name: cleanName,
      username: cleanUser,
      password: cleanPass
    };

    setAdmins(prev => prev.map(a => a.id === id ? updatedUser : a));
    if (currentAdmin?.id === id) {
      setCurrentAdmin(updatedUser);
    }

    // Also update barber name if tied to a personal barber profile
    if (updatedUser.barberId) {
      setBarbers(prev => prev.map(b => b.id === updatedUser.barberId ? { ...b, name: cleanName } : b));
    }

    addNotification('Dados Atualizados', `Os dados do administrador @${cleanUser} foram alterados com sucesso.`, 'sync');
    return { success: true, message: 'Dados do administrador atualizados com sucesso!' };
  }, [admins, currentAdmin, addNotification]);

  return (
    <BarberContext.Provider
      value={{
        profile,
        services,
        barbers,
        appointments,
        receipts,
        notifications,
        supabaseConfig,
        activeView,
        setActiveView,
        selectedReceipt,
        setSelectedReceipt,
        admins,
        currentAdmin,
        currentAdminBarber,
        loginAdmin,
        logoutAdmin,
        addAdmin,
        deleteAdmin,
        updateAdminPassword,
        updateAdminProfile,
        updateAdminBarberLink,
        updateProfile,
        addAppointment,
        confirmAppointment,
        completeAppointment,
        cancelAppointment,
        deleteAppointment,
        addService,
        updateService,
        deleteService,
        addBarber,
        updateBarber,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        updateSupabaseConfig,
        syncWithSupabase
      }}
    >
      {children}
    </BarberContext.Provider>
  );
};

export const useBarber = (): BarberContextType => {
  const context = useContext(BarberContext);
  if (!context) {
    throw new Error('useBarber must be used within a BarberProvider');
  }
  return context;
};
