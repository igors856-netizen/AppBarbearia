import { BarberShopProfile, Barber, Service, Appointment, Receipt, AdminUser } from '../types';

export const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm_superuser',
    name: 'Superusuário',
    username: 'superuser',
    password: '123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'adm_igor',
    name: 'Igor Silveira',
    username: 'igor',
    password: '123456',
    role: 'admin',
    barberId: 'barber_igor',
    createdAt: '2026-01-10T10:00:00.000Z',
    lastLogin: '2026-09-10T09:00:00.000Z'
  },
  {
    id: 'adm_igor2',
    name: 'Igor Segundo',
    username: 'igor2',
    password: '123456789',
    role: 'admin',
    barberId: 'barber_igor2',
    createdAt: '2026-01-15T14:30:00.000Z',
    lastLogin: '2026-09-09T18:20:00.000Z'
  }
];

export const DEFAULT_PROFILE: BarberShopProfile = {
  id: 'profile_default',
  name: 'Barbearia Don Corleone',
  slogan: 'Tradição, Estilo e Precisão desde 2018',
  logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=240&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
  primaryColor: '#f59e0b', // Amber
  accentColor: '#d97706',
  phoneWhatsApp: '5511987654321',
  address: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
  openingTime: '09:00',
  closingTime: '20:00',
  lunchBreakEnabled: true,
  lunchStart: '12:00',
  lunchEnd: '13:00',
  slotIntervalMinutes: 30,
  daysOpen: [1, 2, 3, 4, 5, 6], // Mon-Sat
  pixKey: 'contato@barbeariadon.com.br',
  pixKeyType: 'email'
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv_1',
    name: 'Corte Tradicional & Fade',
    description: 'Corte navalhado ou degradê moderno, lavagem especial e finalização com pomada premium.',
    durationMinutes: 40,
    price: 60.0,
    category: 'cabelo',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'srv_2',
    name: 'Barboterapia & Toalha Quente',
    description: 'Modelagem completa da barba, esfoliação facial, toalha quente aromática e óleo pós-barba.',
    durationMinutes: 35,
    price: 50.0,
    category: 'barba',
    imageUrl: 'https://images.unsplash.com/photo-1517832606589-7629c33971f6?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'srv_3',
    name: 'Combo Don Corleone (Cabelo + Barba)',
    description: 'Experiência completa com corte na tesoura ou máquina, barboterapia relaxante e café cortesia.',
    durationMinutes: 60,
    price: 95.0,
    category: 'combo',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'srv_4',
    name: 'Pigmentação & Camuflagem de Grisalhos',
    description: 'Correção sutil e elegante das falhas na barba ou fios grisalhos com acabamento natural.',
    durationMinutes: 30,
    price: 45.0,
    category: 'estetica',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'srv_5',
    name: 'Design de Sobrancelha na Navalha',
    description: 'Alinhamento preciso das sobrancelhas mantendo a naturalidade masculina.',
    durationMinutes: 15,
    price: 25.0,
    category: 'estetica',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=80'
  }
];

export const DEFAULT_BARBERS: Barber[] = [
  {
    id: 'barber_igor',
    name: 'Igor Silveira',
    specialty: 'Master Barber • Visagismo, Degradê & Tesoura',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    bio: 'Administrador e Barbeiro Master. Especialista em cortes clássicos e visagismo.',
    phone: '5511987654321',
    active: true
  },
  {
    id: 'barber_igor2',
    name: 'Igor Segundo',
    specialty: 'Fade Navalhado, Freestyle & Barboterapia',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    bio: 'Administrador e Barbeiro. Especialista em técnicas modernas de barbearia.',
    phone: '5511987654322',
    active: true
  },
  {
    id: 'barber_1',
    name: 'Lucas "Navalha de Ouro"',
    specialty: 'Especialista em Degradê, Freestyle e Tesoura Clássica',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Mais de 8 anos de experiência em cortes modernos e alinhamento clássico.',
    phone: '5511991234567',
    active: true
  },
  {
    id: 'barber_2',
    name: 'Matheus Silva',
    specialty: 'Mestre em Barboterapia e Barba Rústica',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Técnicas orientais de toalha quente e finalização com bálsamos naturais.',
    phone: '5511992345678',
    active: true
  },
  {
    id: 'barber_3',
    name: 'Rafael Costa',
    specialty: 'Cortes Vintage, Pompadour & Pigmentação',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    bio: 'Instrutor de barbearia tradicional e especialista em visagismo facial.',
    phone: '5511993456789',
    active: true
  }
];

// Helper to generate appointments for today and past days this month
const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  // Igor Silveira's Schedule
  {
    id: 'apt_igor_1',
    customerName: 'Vinicius Prado',
    customerPhone: '11991122334',
    customerEmail: 'vinicius.prado@gmail.com',
    barberId: 'barber_igor',
    barberName: 'Igor Silveira',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getTodayStr(),
    time: '09:30',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'pix',
    notes: 'Degradê baixo na navalha',
    createdAt: new Date().toISOString(),
    receiptId: 'rcpt_igor_1'
  },
  {
    id: 'apt_igor_2',
    customerName: 'Gabriel Moreira',
    customerPhone: '11984433221',
    customerEmail: 'gabriel.moreira@outlook.com',
    barberId: 'barber_igor',
    barberName: 'Igor Silveira',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getTodayStr(),
    time: '11:00',
    status: 'confirmed',
    paymentStatus: 'pending',
    notes: 'Toalha quente e barba alinhada',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_igor_3',
    customerName: 'Alexandre Torres',
    customerPhone: '11973344556',
    customerEmail: 'alexandre.torres@gmail.com',
    barberId: 'barber_igor',
    barberName: 'Igor Silveira',
    serviceId: 'srv_2',
    serviceName: 'Barboterapia & Toalha Quente',
    servicePrice: 50.0,
    date: getTodayStr(),
    time: '15:30',
    status: 'scheduled',
    paymentStatus: 'pending',
    notes: 'Cliente novo indicado por Gabriel',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_igor_4',
    customerName: 'Marcos Vinicius',
    customerPhone: '11962233445',
    barberId: 'barber_igor',
    barberName: 'Igor Silveira',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getRelativeDateStr(1),
    time: '14:00',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  },

  // Igor Segundo's Schedule
  {
    id: 'apt_igor2_1',
    customerName: 'Danilo Barbosa',
    customerPhone: '11998877665',
    customerEmail: 'danilo.barbosa@uol.com.br',
    barberId: 'barber_igor2',
    barberName: 'Igor Segundo',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getTodayStr(),
    time: '10:00',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card_credit',
    notes: 'Fade alto e alinhamento do bigode',
    createdAt: new Date().toISOString(),
    receiptId: 'rcpt_igor2_1'
  },
  {
    id: 'apt_igor2_2',
    customerName: 'Renato Vasconcelos',
    customerPhone: '11987766554',
    customerEmail: 'renato.v@gmail.com',
    barberId: 'barber_igor2',
    barberName: 'Igor Segundo',
    serviceId: 'srv_4',
    serviceName: 'Pigmentação & Camuflagem de Grisalhos',
    servicePrice: 45.0,
    date: getTodayStr(),
    time: '13:30',
    status: 'confirmed',
    paymentStatus: 'pending',
    notes: 'Pigmentação sutil',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_igor2_3',
    customerName: 'Luciano Albuquerque',
    customerPhone: '11976655443',
    barberId: 'barber_igor2',
    barberName: 'Igor Segundo',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getTodayStr(),
    time: '16:30',
    status: 'scheduled',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_igor2_4',
    customerName: 'Paulo Roberto',
    customerPhone: '11965544332',
    barberId: 'barber_igor2',
    barberName: 'Igor Segundo',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getRelativeDateStr(1),
    time: '11:00',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_1',
    customerName: 'Carlos Eduardo Mendes',
    customerPhone: '11988776655',
    customerEmail: 'carlos.mendes@gmail.com',
    barberId: 'barber_1',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getTodayStr(),
    time: '10:00',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'pix',
    notes: 'Prefere cabelo aparado na tesoura em cima',
    createdAt: new Date().toISOString(),
    receiptId: 'rcpt_1'
  },
  {
    id: 'apt_2',
    customerName: 'Guilherme Alencar',
    customerPhone: '11977665544',
    customerEmail: 'gui.alencar@hotmail.com',
    barberId: 'barber_2',
    barberName: 'Matheus Silva',
    serviceId: 'srv_2',
    serviceName: 'Barboterapia & Toalha Quente',
    servicePrice: 50.0,
    date: getTodayStr(),
    time: '11:30',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card_credit',
    notes: 'Pele sensível no pescoço',
    createdAt: new Date().toISOString(),
    receiptId: 'rcpt_2'
  },
  {
    id: 'apt_3',
    customerName: 'Rodrigo Paiva',
    customerPhone: '11999881122',
    customerEmail: 'rodrigo.paiva@gmail.com',
    barberId: 'barber_1',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getTodayStr(),
    time: '14:00',
    status: 'confirmed',
    paymentStatus: 'pending',
    notes: 'Degradê mid fade',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_4',
    customerName: 'Felipe Santos',
    customerPhone: '11982233445',
    barberId: 'barber_3',
    barberName: 'Rafael Costa',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getTodayStr(),
    time: '16:00',
    status: 'scheduled',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_5',
    customerName: 'Thiago Oliveira',
    customerPhone: '11971122334',
    barberId: 'barber_2',
    barberName: 'Matheus Silva',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getRelativeDateStr(1),
    time: '10:30',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_6',
    customerName: 'Marcelo Rezende',
    customerPhone: '11963344556',
    barberId: 'barber_1',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getRelativeDateStr(-1),
    time: '15:00',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'pix',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    receiptId: 'rcpt_3'
  },
  {
    id: 'apt_7',
    customerName: 'Bruno Henrique',
    customerPhone: '11985566778',
    barberId: 'barber_3',
    barberName: 'Rafael Costa',
    serviceId: 'srv_4',
    serviceName: 'Pigmentação & Camuflagem de Grisalhos',
    servicePrice: 45.0,
    date: getRelativeDateStr(-2),
    time: '17:00',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    receiptId: 'rcpt_4'
  },
  {
    id: 'apt_8',
    customerName: 'Danilo Ramos',
    customerPhone: '11994455667',
    barberId: 'barber_1',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceId: 'srv_1',
    serviceName: 'Corte Tradicional & Fade',
    servicePrice: 60.0,
    date: getRelativeDateStr(-3),
    time: '11:00',
    status: 'cancelled',
    paymentStatus: 'pending',
    cancellationReason: 'Imprevisto no trabalho de última hora',
    cancelledAt: new Date(Date.now() - 259200000).toISOString(),
    cancelledBy: 'client',
    createdAt: new Date(Date.now() - 260000000).toISOString()
  },
  {
    id: 'apt_9',
    customerName: 'Vinicius Prado',
    customerPhone: '11975544332',
    barberId: 'barber_2',
    barberName: 'Matheus Silva',
    serviceId: 'srv_3',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    servicePrice: 95.0,
    date: getRelativeDateStr(-4),
    time: '18:00',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card_debit',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    receiptId: 'rcpt_5'
  }
];

export const DEFAULT_RECEIPTS: Receipt[] = [
  {
    id: 'rcpt_igor_1',
    receiptNumber: 'RCP-2026-0015',
    appointmentId: 'apt_igor_1',
    issuedAt: new Date().toISOString(),
    customerName: 'Vinicius Prado',
    customerPhone: '11991122334',
    barberName: 'Igor Silveira',
    serviceName: 'Corte Tradicional & Fade',
    amount: 60.0,
    paymentMethod: 'pix',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-88IG-1001'
  },
  {
    id: 'rcpt_igor2_1',
    receiptNumber: 'RCP-2026-0016',
    appointmentId: 'apt_igor2_1',
    issuedAt: new Date().toISOString(),
    customerName: 'Danilo Barbosa',
    customerPhone: '11998877665',
    barberName: 'Igor Segundo',
    serviceName: 'Corte Tradicional & Fade',
    amount: 60.0,
    paymentMethod: 'card_credit',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-99IG-2002'
  },
  {
    id: 'rcpt_1',
    receiptNumber: 'RCP-2026-0012',
    appointmentId: 'apt_1',
    issuedAt: new Date().toISOString(),
    customerName: 'Carlos Eduardo Mendes',
    customerPhone: '11988776655',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    amount: 95.0,
    paymentMethod: 'pix',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-98F4-A1C2'
  },
  {
    id: 'rcpt_2',
    receiptNumber: 'RCP-2026-0013',
    appointmentId: 'apt_2',
    issuedAt: new Date().toISOString(),
    customerName: 'Guilherme Alencar',
    customerPhone: '11977665544',
    barberName: 'Matheus Silva',
    serviceName: 'Barboterapia & Toalha Quente',
    amount: 50.0,
    paymentMethod: 'card_credit',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-77B2-C3D4'
  },
  {
    id: 'rcpt_3',
    receiptNumber: 'RCP-2026-0010',
    appointmentId: 'apt_6',
    issuedAt: new Date(Date.now() - 86400000).toISOString(),
    customerName: 'Marcelo Rezende',
    customerPhone: '11963344556',
    barberName: 'Lucas "Navalha de Ouro"',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    amount: 95.0,
    paymentMethod: 'pix',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-44E9-F110'
  },
  {
    id: 'rcpt_4',
    receiptNumber: 'RCP-2026-0009',
    appointmentId: 'apt_7',
    issuedAt: new Date(Date.now() - 172800000).toISOString(),
    customerName: 'Bruno Henrique',
    customerPhone: '11985566778',
    barberName: 'Rafael Costa',
    serviceName: 'Pigmentação & Camuflagem de Grisalhos',
    amount: 45.0,
    paymentMethod: 'cash',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-33A1-D882'
  },
  {
    id: 'rcpt_5',
    receiptNumber: 'RCP-2026-0008',
    appointmentId: 'apt_9',
    issuedAt: new Date(Date.now() - 345600000).toISOString(),
    customerName: 'Vinicius Prado',
    customerPhone: '11975544332',
    barberName: 'Matheus Silva',
    serviceName: 'Combo Don Corleone (Cabelo + Barba)',
    amount: 95.0,
    paymentMethod: 'card_debit',
    shopName: 'Barbearia Don Corleone',
    shopAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP',
    shopPhone: '5511987654321',
    authCode: 'AUT-12C8-K903'
  }
];
