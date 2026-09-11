import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarberShopProfile, 
  Barber, 
  Service, 
  Appointment, 
  AppointmentStatus,
  Receipt, 
  InAppNotification, 
  SupabaseConfig, 
  ActiveView,
  PaymentMethod,
  AdminUser
} from '../types';
import { 
  DEFAULT_SHOPS, 
  DEFAULT_SERVICES, 
  DEFAULT_BARBERS, 
  DEFAULT_APPOINTMENTS, 
  DEFAULT_RECEIPTS,
  DEFAULT_ADMINS
} from '../data/defaultData';
import { getSupabaseClient, syncAppointmentsWithSupabase } from '../services/supabase';

interface BarberContextType {
  profile: BarberShopProfile;
  barbershops: BarberShopProfile[];
  activeShopId: string;
  isSuperUser: boolean;
  setActiveShopId: (id: string) => boolean | void;
  switchBarbershop: (id: string) => boolean | void;
  createBarbershop: (data: Partial<BarberShopProfile>) => BarberShopProfile;
  addBarbershop: (data: Partial<BarberShopProfile>) => BarberShopProfile;
  deleteBarbershop: (id: string) => boolean;
  services: Service[];
  barbers: Barber[];
  allBarbers: Barber[];
  appointments: Appointment[];
  allAppointments: Appointment[];
  receipts: Receipt[];
  notifications: InAppNotification[];
  supabaseConfig: SupabaseConfig;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  
  // Admin Management
  admins: AdminUser[];
  currentAdmin: AdminUser | null;
  currentAdminBarber: Barber | undefined;
  loginAdmin: (username: string, password: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  addAdmin: (data: { 
    name: string; 
    username: string; 
    password: string; 
    role?: 'superuser' | 'admin' | 'manager';
    barberId?: string;
    createBarberProfile?: boolean;
    specialty?: string;
    createNewShop?: boolean;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    targetShopId?: string;
  }) => { success: boolean; message: string; shopId?: string };
  deleteAdmin: (id: string) => { success: boolean; message: string };
  updateAdminPassword: (id: string, newPass: string) => { success: boolean; message: string };
  updateAdminProfile: (id: string, data: { name?: string; username?: string; password?: string }) => { success: boolean; message: string };
  updateAdminBarberLink: (adminId: string, barberId: string) => void;

  // Business Actions
  updateProfile: (profile: Partial<BarberShopProfile>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'> & Partial<Pick<Appointment, 'status'>>) => Appointment;
  confirmAppointment: (id: string) => void;
  completeAppointment: (id: string, paymentMethod?: PaymentMethod) => Receipt;
  cancelAppointment: (id: string, reason?: string, cancelledBy?: 'client' | 'barber') => void;
  deleteAppointment: (id: string) => void;
  getAvailableSlots: (barberId: string, dateStr: string) => string[];
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  markAppointmentAsPaid: (id: string, paymentMethod?: PaymentMethod) => Receipt;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addBarber: (barber: Omit<Barber, 'id'>) => void;
  updateBarber: (id: string, barber: Partial<Barber>) => void;
  addNotification: (title: string, message: string, type: InAppNotification['type'], meta?: { appointmentId?: string; customerName?: string }) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
}

const BarberContext = createContext<BarberContextType | undefined>(undefined);

const loadDataFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
};

const saveDataToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-shop / Barbearias State
  const [barbershops, setBarbershops] = useState<BarberShopProfile[]>(() => 
    loadDataFromStorage('barberpro_shops_v3', DEFAULT_SHOPS)
  );

  const [activeShopId, setActiveShopIdState] = useState<string>(() => 
    loadDataFromStorage('barberpro_active_shop_id', DEFAULT_SHOPS[0].id)
  );

  const profile = useMemo(() => {
    return barbershops.find(s => s.id === activeShopId) || barbershops[0] || DEFAULT_SHOPS[0];
  }, [barbershops, activeShopId]);

  // Master Raw Data (Source of truth)
  const [rawBarbers, setRawBarbers] = useState<Barber[]>(() => 
    loadDataFromStorage('barberpro_barbers_v3', DEFAULT_BARBERS)
  );

  const [rawAppointments, setRawAppointments] = useState<Appointment[]>(() => 
    loadDataFromStorage('barberpro_appointments_v3', DEFAULT_APPOINTMENTS)
  );

  const [services, setServices] = useState<Service[]>(() => 
    loadDataFromStorage('barberpro_services_v3', DEFAULT_SERVICES)
  );

  const [receipts, setReceipts] = useState<Receipt[]>(() => 
    loadDataFromStorage('barberpro_receipts_v3', DEFAULT_RECEIPTS)
  );

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => 
    loadDataFromStorage('barberpro_notifications_v3', [])
  );

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => 
    loadDataFromStorage('barberpro_supabase_config_v3', {
      url: '',
      anonKey: '',
      connected: false
    })
  );

  const [activeView, setActiveView] = useState<ActiveView>('client');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Admin users state
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const loaded = loadDataFromStorage('barberpro_admins_v3', DEFAULT_ADMINS);
    return loaded.map(a => a.username.toLowerCase() === 'superuser' ? { ...a, role: 'superuser' as const } : a);
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const loaded = loadDataFromStorage<AdminUser | null>('barberpro_current_admin', null);
    if (loaded && loaded.username.toLowerCase() === 'superuser') {
      return { ...loaded, role: 'superuser' };
    }
    return loaded;
  });

  const isSuperUser = useMemo(() => {
    return currentAdmin?.role === 'superuser' || currentAdmin?.username?.toLowerCase() === 'superuser';
  }, [currentAdmin]);

  // Sync to localStorage
  useEffect(() => {
    saveDataToStorage('barberpro_shops_v3', barbershops);
  }, [barbershops]);

  useEffect(() => {
    saveDataToStorage('barberpro_active_shop_id', activeShopId);
  }, [activeShopId]);

  useEffect(() => {
    saveDataToStorage('barberpro_barbers_v3', rawBarbers);
  }, [rawBarbers]);

  useEffect(() => {
    saveDataToStorage('barberpro_appointments_v3', rawAppointments);
  }, [rawAppointments]);

  useEffect(() => {
    saveDataToStorage('barberpro_services_v3', services);
  }, [services]);

  useEffect(() => {
    saveDataToStorage('barberpro_receipts_v3', receipts);
  }, [receipts]);

  useEffect(() => {
    saveDataToStorage('barberpro_notifications_v3', notifications);
  }, [notifications]);

  useEffect(() => {
    saveDataToStorage('barberpro_supabase_config_v3', supabaseConfig);
  }, [supabaseConfig]);

  useEffect(() => {
    saveDataToStorage('barberpro_admins_v3', admins);
  }, [admins]);

  useEffect(() => {
    saveDataToStorage('barberpro_current_admin', currentAdmin);
  }, [currentAdmin]);

  // Scoped Barbers Selector:
  // - When logged in as superuser: sees all barbers of the active barbearia
  // - When logged in as specific admin: sees only barbers belonging to this admin and this barbearia (or linked to their adminId)
  // - When in client view: shows all active barbers for the active barbearia
  const barbers = useMemo(() => {
    return rawBarbers.filter(barber => {
      const matchShop = !barber.shopId || barber.shopId === activeShopId;
      if (!matchShop) return false;

      // In admin dashboard view:
      if (currentAdmin) {
        if (isSuperUser) return true;
        // Scoped to this admin:
        return barber.adminId === currentAdmin.id || barber.id === currentAdmin.barberId || (!barber.adminId && barber.shopId === activeShopId);
      }

      // In client view:
      return barber.active;
    });
  }, [rawBarbers, activeShopId, currentAdmin, isSuperUser]);

  // Scoped Appointments Selector:
  // - Superuser sees all appointments for active shop
  // - Admin sees only appointments for their own barbers in this shop
  // - Client view uses active shop
  const appointments = useMemo(() => {
    return rawAppointments.filter(apt => {
      const matchShop = !apt.shopId || apt.shopId === activeShopId;
      if (!matchShop) return false;

      if (currentAdmin) {
        if (isSuperUser) return true;
        // Check if the barber in this appointment belongs to this admin
        const barberIdsForAdmin = barbers.map(b => b.id);
        return barberIdsForAdmin.includes(apt.barberId);
      }

      return true;
    });
  }, [rawAppointments, activeShopId, currentAdmin, barbers, isSuperUser]);

  // Notifications System
  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: InAppNotification['type'], 
    meta?: { appointmentId?: string; customerName?: string }
  ) => {
    const newNotification: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      appointmentId: meta?.appointmentId,
      customerName: meta?.customerName
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Troca de filial: Somente para o superuser (requisito do sistema)
  const setActiveShopId = useCallback((id: string) => {
    if (currentAdmin && !isSuperUser && currentAdmin.shopId && currentAdmin.shopId !== id) {
      addNotification(
        'Acesso Restrito',
        'Troca de filial permitida somente para o Superusuário.',
        'cancellation'
      );
      return false;
    }
    setActiveShopIdState(id);
    if (currentAdmin && isSuperUser) {
      setCurrentAdmin(prev => prev ? { ...prev, shopId: id } : null);
      setAdmins(prev => prev.map(a => a.id === currentAdmin.id ? { ...a, shopId: id } : a));
    }
    return true;
  }, [currentAdmin, isSuperUser, addNotification]);

  const switchBarbershop = useCallback((id: string) => {
    return setActiveShopId(id);
  }, [setActiveShopId]);

  // Criação de nova filial: Somente para o superuser (requisito do sistema)
  const createBarbershop = useCallback((data: Partial<BarberShopProfile>) => {
    if (!isSuperUser) {
      addNotification(
        'Acesso Negado',
        'Somente o Superusuário possui permissão para criar novas filiais.',
        'cancellation'
      );
      throw new Error('Somente o Superusuário pode criar novas filiais.');
    }

    const newId = `shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newShop: BarberShopProfile = {
      id: newId,
      adminId: currentAdmin?.id,
      name: data.name?.trim() || 'Nova Filial Barbearia',
      slogan: data.slogan?.trim() || 'Tradição, Estilo e Precisão',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=240&auto=format&fit=crop&q=80',
      coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
      primaryColor: data.primaryColor || '#f59e0b',
      accentColor: data.accentColor || '#d97706',
      phoneWhatsApp: data.phoneWhatsApp || profile.phoneWhatsApp || '5511987654321',
      address: data.address || 'Rua da Barbearia, 100 - Centro',
      openingTime: data.openingTime || '09:00',
      closingTime: data.closingTime || '20:00',
      lunchBreakEnabled: data.lunchBreakEnabled ?? true,
      lunchStart: data.lunchStart || '12:00',
      lunchEnd: data.lunchEnd || '13:00',
      slotIntervalMinutes: data.slotIntervalMinutes || 30,
      daysOpen: data.daysOpen || [1, 2, 3, 4, 5, 6],
      pixKey: data.pixKey || '',
      pixKeyType: data.pixKeyType || 'email'
    };

    setBarbershops(prev => [...prev, newShop]);
    setActiveShopIdState(newId);

    addNotification(
      'Nova Filial Criada',
      `A filial "${newShop.name}" foi criada com sucesso pelo Superusuário!`,
      'sync'
    );

    return newShop;
  }, [isSuperUser, currentAdmin, profile.phoneWhatsApp, addNotification]);

  const addBarbershop = useCallback((data: Partial<BarberShopProfile>) => {
    return createBarbershop(data);
  }, [createBarbershop]);

  const deleteBarbershop = useCallback((id: string) => {
    if (!isSuperUser) {
      addNotification('Acesso Negado', 'Somente o Superusuário pode excluir filiais.', 'cancellation');
      return false;
    }
    if (barbershops.length <= 1) return false;
    setBarbershops(prev => prev.filter(s => s.id !== id));
    if (activeShopId === id) {
      const remaining = barbershops.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveShopIdState(remaining[0].id);
      }
    }
    addNotification('Filial Removida', 'A filial foi removida do sistema.', 'cancellation');
    return true;
  }, [isSuperUser, barbershops, activeShopId, addNotification]);

  const updateProfile = useCallback((updated: Partial<BarberShopProfile>) => {
    setBarbershops(prev => prev.map(shop => {
      if (shop.id === activeShopId) {
        return { ...shop, ...updated };
      }
      return shop;
    }));
    addNotification('Configurações Salvas', 'Os dados da barbearia foram atualizados com sucesso.', 'sync');
  }, [activeShopId, addNotification]);

  const addAppointment = useCallback((
    aptData: Omit<Appointment, 'id' | 'createdAt' | 'status'> & Partial<Pick<Appointment, 'status'>>
  ) => {
    const newAppointment: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      shopId: aptData.shopId || activeShopId,
      createdAt: new Date().toISOString(),
      status: aptData.status || 'scheduled'
    };

    setRawAppointments(prev => [newAppointment, ...prev]);

    addNotification(
      'Novo Agendamento Realizado!',
      `${newAppointment.customerName} agendou ${newAppointment.serviceName} com ${newAppointment.barberName} para ${newAppointment.date} às ${newAppointment.time}.`,
      'new_booking',
      { appointmentId: newAppointment.id, customerName: newAppointment.customerName }
    );

    return newAppointment;
  }, [activeShopId, addNotification]);

  const confirmAppointment = useCallback((id: string) => {
    setRawAppointments(prev => prev.map(a => {
      if (a.id === id) {
        addNotification(
          'Agendamento Confirmado',
          `O atendimento de ${a.customerName} foi confirmado para ${a.date} às ${a.time}.`,
          'new_booking',
          { appointmentId: a.id, customerName: a.customerName }
        );
        return { ...a, status: 'confirmed' };
      }
      return a;
    }));
  }, [addNotification]);

  const completeAppointment = useCallback((id: string, paymentMethod: PaymentMethod = 'pix') => {
    let generatedReceipt: Receipt | null = null;

    setRawAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const receipt: Receipt = {
          id: `rec_${Date.now()}`,
          receiptNumber,
          appointmentId: a.id,
          issuedAt: new Date().toISOString(),
          customerName: a.customerName,
          customerPhone: a.customerPhone,
          barberName: a.barberName,
          serviceName: a.serviceName,
          amount: a.servicePrice,
          paymentMethod,
          shopName: profile.name,
          shopAddress: profile.address,
          shopPhone: profile.phoneWhatsApp,
          authCode: Math.random().toString(36).substring(2, 10).toUpperCase()
        };

        generatedReceipt = receipt;
        setReceipts(r => [receipt, ...r]);
        setSelectedReceipt(receipt);

        addNotification(
          'Atendimento Finalizado & Comprovante Gerado',
          `Serviço de ${a.customerName} concluído com sucesso. Faturamento de R$ ${a.servicePrice.toFixed(2)} registrado.`,
          'completion',
          { appointmentId: a.id, customerName: a.customerName }
        );

        return {
          ...a,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod,
          receiptId: receipt.id
        };
      }
      return a;
    }));

    return generatedReceipt!;
  }, [profile, addNotification]);

  const cancelAppointment = useCallback((id: string, reason?: string, cancelledBy: 'client' | 'barber' = 'barber') => {
    setRawAppointments(prev => prev.map(a => {
      if (a.id === id) {
        addNotification(
          'Agendamento Cancelado',
          `O agendamento de ${a.customerName} (${a.date} às ${a.time}) foi cancelado. Motivo: ${reason || 'Não informado'}.`,
          'cancellation',
          { appointmentId: a.id, customerName: a.customerName }
        );
        return {
          ...a,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason || 'Cancelado pelo usuário',
          cancelledBy
        };
      }
      return a;
    }));
  }, [addNotification]);

  const deleteAppointment = useCallback((id: string) => {
    setRawAppointments(prev => prev.filter(a => a.id !== id));
    addNotification('Registro Excluído', 'O agendamento foi removido permanentemente do histórico.', 'sync');
  }, [addNotification]);

  // Calcula horários disponíveis para o profissional na data selecionada
  const getAvailableSlots = useCallback((barberId: string, dateStr: string): string[] => {
    if (!barberId || !dateStr) return [];

    // Validar se o dia da semana está aberto na filial
    const parts = dateStr.split('-');
    if (parts.length !== 3) return [];
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day, 12, 0, 0);
    const dayOfWeek = dateObj.getDay();

    const daysOpen = profile.daysOpen || [1, 2, 3, 4, 5, 6];
    if (!daysOpen.includes(dayOfWeek)) {
      return [];
    }

    const startMinutes = timeToMinutes(profile.openingTime || '09:00');
    const endMinutes = timeToMinutes(profile.closingTime || '20:00');
    const interval = profile.slotIntervalMinutes || 30;

    const lunchStart = profile.lunchBreakEnabled && profile.lunchStart ? timeToMinutes(profile.lunchStart) : null;
    const lunchEnd = profile.lunchBreakEnabled && profile.lunchEnd ? timeToMinutes(profile.lunchEnd) : null;

    // Horários já agendados e ativos (não cancelados) para o barbeiro na data
    const bookedTimes = new Set(
      rawAppointments
        .filter(a => a.barberId === barberId && a.date === dateStr && a.status !== 'cancelled')
        .map(a => a.time)
    );

    const slots: string[] = [];
    for (let m = startMinutes; m + interval <= endMinutes; m += interval) {
      // Pular intervalo de almoço se habilitado
      if (lunchStart !== null && lunchEnd !== null && m >= lunchStart && m < lunchEnd) {
        continue;
      }
      const timeStr = minutesToTime(m);
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }

    return slots;
  }, [profile, rawAppointments]);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setRawAppointments(prev => prev.map(a => {
      if (a.id === id) {
        if (status === 'confirmed') {
          addNotification(
            'Agendamento Confirmado',
            `O atendimento de ${a.customerName} foi confirmado para ${a.date} às ${a.time}.`,
            'new_booking',
            { appointmentId: a.id, customerName: a.customerName }
          );
        }
        return { ...a, status };
      }
      return a;
    }));
  }, [addNotification]);

  const markAppointmentAsPaid = useCallback((id: string, paymentMethod: PaymentMethod = 'pix'): Receipt => {
    return completeAppointment(id, paymentMethod);
  }, [completeAppointment]);

  const addService = useCallback((srvData: Omit<Service, 'id'>) => {
    if (currentAdmin && !isSuperUser) {
      addNotification('Acesso Restrito', 'Administradores só possuem permissão para cadastrar barbeiros.', 'cancellation');
      return;
    }
    const newService: Service = {
      ...srvData,
      id: `srv_${Date.now()}`,
      shopId: srvData.shopId || activeShopId
    };
    setServices(prev => [...prev, newService]);
    addNotification('Novo Serviço Cadastrado', `${newService.name} agora está disponível para agendamento online.`, 'sync');
  }, [currentAdmin, isSuperUser, activeShopId, addNotification]);

  const updateService = useCallback((id: string, updated: Partial<Service>) => {
    if (currentAdmin && !isSuperUser) {
      addNotification('Acesso Restrito', 'Administradores só possuem permissão para cadastrar barbeiros.', 'cancellation');
      return;
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    addNotification('Serviço Atualizado', 'As informações do serviço foram salvas.', 'sync');
  }, [currentAdmin, isSuperUser, addNotification]);

  const deleteService = useCallback((id: string) => {
    if (currentAdmin && !isSuperUser) {
      addNotification('Acesso Restrito', 'Administradores só possuem permissão para cadastrar barbeiros.', 'cancellation');
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
    addNotification('Serviço Removido', 'O serviço foi desativado do catálogo.', 'cancellation');
  }, [currentAdmin, isSuperUser, addNotification]);

  // Adding a new barber scopes them directly to currentAdmin and activeShopId!
  const addBarber = useCallback((barberData: Omit<Barber, 'id'>) => {
    const newBarber: Barber = {
      ...barberData,
      id: `barber_${Date.now()}`,
      shopId: barberData.shopId || activeShopId,
      adminId: currentAdmin?.id
    };
    setRawBarbers(prev => [...prev, newBarber]);
    addNotification(
      'Novo Barbeiro Cadastrado', 
      `${newBarber.name} foi adicionado à sua equipe com agenda exclusiva.`, 
      'sync'
    );
  }, [activeShopId, currentAdmin, addNotification]);

  const updateBarber = useCallback((id: string, updated: Partial<Barber>) => {
    setRawBarbers(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    addNotification('Barbeiro Atualizado', 'Os dados do profissional foram salvos.', 'sync');
  }, [addNotification]);

  const updateSupabaseConfig = useCallback((cfg: Partial<SupabaseConfig>) => {
    setSupabaseConfig(prev => ({ ...prev, ...cfg }));
  }, []);

  const syncWithSupabase = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      return { success: false, message: 'URL e Chave Anônima do Supabase são obrigatórias.' };
    }

    try {
      const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
      const { data, error } = await client.from('appointments').select('*').order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedApts: Appointment[] = data.map((row: any) => ({
          id: row.id,
          shopId: row.shop_id || activeShopId,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          customerEmail: row.customer_email,
          barberId: row.barber_id,
          barberName: row.barber_name,
          serviceId: row.service_id,
          serviceName: row.service_name,
          servicePrice: Number(row.service_price),
          date: row.appointment_date || row.date,
          time: row.appointment_time || row.time,
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
        setRawAppointments(mappedApts);
      }

      setSupabaseConfig(prev => ({
        ...prev,
        connected: true,
        lastSync: new Date().toISOString()
      }));

      addNotification('Sincronização Supabase Concluída', 'Banco de dados em nuvem sincronizado em tempo real.', 'sync');
      return { success: true, message: 'Sincronizado com sucesso com o Supabase!' };
    } catch (err: any) {
      setSupabaseConfig(prev => ({ ...prev, connected: false }));
      return { success: false, message: err.message || 'Erro ao sincronizar com Supabase' };
    }
  }, [supabaseConfig, activeShopId, addNotification]);

  // Admin Auth Methods
  const loginAdmin = useCallback((username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = admins.find(
      a => a.username.toLowerCase() === cleanUser && a.password === cleanPass
    );

    if (found) {
      const isSuper = found.role === 'superuser' || cleanUser === 'superuser';
      const updatedUser: AdminUser = {
        ...found,
        role: isSuper ? 'superuser' : (found.role || 'admin'),
        lastLogin: new Date().toISOString()
      };
      setCurrentAdmin(updatedUser);
      setAdmins(prev => prev.map(a => a.id === found.id ? updatedUser : a));
      if (found.shopId) {
        setActiveShopIdState(found.shopId);
      }
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

  const currentAdminBarber = useMemo(() => {
    if (!currentAdmin) return undefined;
    if (currentAdmin.barberId) {
      const match = rawBarbers.find(b => b.id === currentAdmin.barberId);
      if (match) return match;
    }
    return rawBarbers.find(b => b.name.toLowerCase() === currentAdmin.name.toLowerCase() && b.shopId === activeShopId);
  }, [currentAdmin, rawBarbers, activeShopId]);

  const updateAdminBarberLink = useCallback((adminId: string, barberId: string) => {
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, barberId } : a));
    if (currentAdmin?.id === adminId) {
      setCurrentAdmin(prev => prev ? { ...prev, barberId } : null);
    }
    addNotification('Agenda Atualizada', 'O vínculo de agenda do administrador foi atualizado com sucesso.', 'sync');
  }, [currentAdmin, addNotification]);

  // Requisito: criar novo administrador somente o superuser
  const addAdmin = useCallback((data: { 
    name: string; 
    username: string; 
    password: string; 
    role?: 'superuser' | 'admin' | 'manager';
    barberId?: string;
    createBarberProfile?: boolean;
    specialty?: string;
    createNewShop?: boolean;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    targetShopId?: string;
  }) => {
    if (!isSuperUser) {
      return { 
        success: false, 
        message: 'Acesso Restrito: Somente o Superusuário possui permissão para cadastrar novos administradores.' 
      };
    }

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

    const newAdminId = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let assignedShopId = data.targetShopId || activeShopId;

    if (data.createNewShop || data.shopName) {
      const newShopId = `shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newShop: BarberShopProfile = {
        id: newShopId,
        adminId: newAdminId,
        name: data.shopName?.trim() || `Barbearia ${cleanName}`,
        slogan: 'Tradição, Estilo e Precisão',
        logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=240&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
        primaryColor: '#f59e0b',
        accentColor: '#d97706',
        phoneWhatsApp: data.shopPhone?.trim() || profile.phoneWhatsApp || '5511987654321',
        address: data.shopAddress?.trim() || 'Rua da Barbearia, 100 - Centro',
        openingTime: '09:00',
        closingTime: '20:00',
        lunchBreakEnabled: true,
        lunchStart: '12:00',
        lunchEnd: '13:00',
        slotIntervalMinutes: 30,
        daysOpen: [1, 2, 3, 4, 5, 6],
        pixKey: '',
        pixKeyType: 'email'
      };
      setBarbershops(prev => [...prev, newShop]);
      assignedShopId = newShopId;
    }

    let linkedBarberId = data.barberId;

    if (data.createBarberProfile !== false && !linkedBarberId) {
      const newBarberId = `barber_${Date.now()}`;
      const newBarber: Barber = {
        id: newBarberId,
        shopId: assignedShopId,
        adminId: newAdminId,
        name: cleanName,
        specialty: data.specialty || 'Barbeiro Profissional & Visagismo',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        bio: `Administrador e Barbeiro. Atendimentos personalizados.`,
        phone: data.shopPhone?.trim() || profile.phoneWhatsApp || '11999998888',
        active: true
      };
      setRawBarbers(prev => [...prev, newBarber]);
      linkedBarberId = newBarberId;
    }

    const newAdmin: AdminUser = {
      id: newAdminId,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      role: data.role || 'admin',
      barberId: linkedBarberId,
      shopId: assignedShopId,
      createdAt: new Date().toISOString()
    };

    setAdmins(prev => [...prev, newAdmin]);
    addNotification(
      'Novo Administrador Cadastrado',
      `O usuário @${cleanUser} (${cleanName}) foi cadastrado com sucesso pelo Superusuário.`,
      'sync'
    );
    return { success: true, message: 'Novo administrador cadastrado com sucesso!', shopId: assignedShopId };
  }, [isSuperUser, admins, activeShopId, profile.phoneWhatsApp, addNotification]);

  // Requisito: Exclusão de administrador somente o superuser
  const deleteAdmin = useCallback((id: string) => {
    if (!isSuperUser) {
      return { success: false, message: 'Somente o Superusuário pode remover administradores.' };
    }
    if (admins.length <= 1) {
      return { success: false, message: 'Não é possível excluir o único administrador do sistema.' };
    }
    const target = admins.find(a => a.id === id);
    if (!target) {
      return { success: false, message: 'Administrador não encontrado.' };
    }
    if (target.role === 'superuser' || target.username.toLowerCase() === 'superuser') {
      return { success: false, message: 'Não é permitido excluir o Superusuário principal do sistema.' };
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
  }, [isSuperUser, admins, currentAdmin, logoutAdmin, addNotification]);

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

    if (updatedUser.barberId) {
      setRawBarbers(prev => prev.map(b => b.id === updatedUser.barberId ? { ...b, name: cleanName } : b));
    }

    addNotification('Dados Atualizados', `Os dados do administrador @${cleanUser} foram alterados com sucesso.`, 'sync');
    return { success: true, message: 'Dados do administrador atualizados com sucesso!' };
  }, [admins, currentAdmin, addNotification]);

  return (
    <BarberContext.Provider
      value={{
        profile,
        barbershops,
        activeShopId,
        isSuperUser,
        setActiveShopId,
        switchBarbershop,
        createBarbershop,
        addBarbershop,
        deleteBarbershop,
        services,
        barbers,
        allBarbers: rawBarbers,
        appointments,
        allAppointments: rawAppointments,
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
        getAvailableSlots,
        updateAppointmentStatus,
        markAppointmentAsPaid,
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

export const useBarber = () => {
  const context = useContext(BarberContext);
  if (!context) {
    throw new Error('useBarber must be used within a BarberProvider');
  }
  return context;
};
