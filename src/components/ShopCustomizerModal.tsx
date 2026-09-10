import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  QrCode, 
  Upload, 
  Trash2, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Scissors,
  ShieldCheck
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';

interface ShopCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopCustomizerModal: React.FC<ShopCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { 
    profile, 
    updateProfile, 
    currentAdmin, 
    updateAdminProfile, 
    barbers, 
    addBarber 
  } = useBarber();

  // File input refs for gallery uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const barberPhotoInputRef = useRef<HTMLInputElement>(null);

  // Shop Profile State
  const [name, setName] = useState(profile.name);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [address, setAddress] = useState(profile.address);
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(profile.phoneWhatsApp);
  const [openingTime, setOpeningTime] = useState(profile.openingTime);
  const [closingTime, setClosingTime] = useState(profile.closingTime);
  const [slotInterval, setSlotInterval] = useState(profile.slotIntervalMinutes);
  const [lunchBreakEnabled, setLunchBreakEnabled] = useState(profile.lunchBreakEnabled ?? true);
  const [lunchStart, setLunchStart] = useState(profile.lunchStart || '12:00');
  const [lunchEnd, setLunchEnd] = useState(profile.lunchEnd || '13:00');
  const [pixKey, setPixKey] = useState(profile.pixKey || '');

  // Admin Data State (for the logged-in administrator)
  const [adminName, setAdminName] = useState(currentAdmin?.name || '');
  const [adminUsername, setAdminUsername] = useState(currentAdmin?.username || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // New Barber Form State
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberPhone, setNewBarberPhone] = useState('');
  const [newBarberBio, setNewBarberBio] = useState('');
  const [newBarberPhoto, setNewBarberPhoto] = useState('');
  const [barberSuccess, setBarberSuccess] = useState<string | null>(null);
  const [barberError, setBarberError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gallery File Handlers (strictly via file upload/gallery)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('A foto selecionada deve ter no máximo 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setLogoUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem selecionada deve ter no máximo 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCoverUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBarberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setBarberError('A foto do barbeiro deve ter no máximo 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setNewBarberPhoto(event.target.result);
          setBarberError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for adding a new barber directly inside this modal
  const handleCreateBarber = (e: React.MouseEvent) => {
    e.preventDefault();
    setBarberError(null);
    setBarberSuccess(null);

    if (!newBarberName.trim()) {
      setBarberError('Por favor, informe o nome do barbeiro.');
      return;
    }

    addBarber({
      name: newBarberName.trim(),
      specialty: newBarberSpecialty.trim() || 'Barbeiro Profissional & Visagismo',
      phone: newBarberPhone.trim() || phoneWhatsApp,
      bio: newBarberBio.trim() || 'Especialista em cortes modernos e barba.',
      photoUrl: newBarberPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      active: true
    });

    setBarberSuccess(`Barbeiro ${newBarberName.trim()} cadastrado com sucesso na equipe!`);
    setNewBarberName('');
    setNewBarberSpecialty('');
    setNewBarberPhone('');
    setNewBarberBio('');
    setNewBarberPhoto('');

    setTimeout(() => {
      setBarberSuccess(null);
    }, 4000);
  };

  // Main Save Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    // If admin data is changed, validate and update
    if (currentAdmin) {
      if (adminPassword) {
        if (adminPassword.length < 3) {
          setAdminError('A nova senha deve ter no mínimo 3 caracteres.');
          return;
        }
        if (adminPassword !== adminConfirmPassword) {
          setAdminError('A confirmação de senha não confere com a nova senha digitada.');
          return;
        }
      }

      const res = updateAdminProfile(currentAdmin.id, {
        name: adminName.trim(),
        username: adminUsername.trim().toLowerCase(),
        password: adminPassword.trim() || undefined
      });

      if (!res.success) {
        setAdminError(res.message);
        return;
      }
    }

    // Update Barber Shop Profile
    updateProfile({
      name,
      slogan,
      logoUrl,
      coverUrl,
      address,
      phoneWhatsApp,
      openingTime,
      closingTime,
      lunchBreakEnabled,
      lunchStart,
      lunchEnd,
      slotIntervalMinutes: Number(slotInterval),
      pixKey
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <div>
              <h3 className="font-black text-white text-base">Personalizar Minha Barbearia</h3>
              <p className="text-[11px] text-neutral-400">Configurações visuais, horários, dados de administrador e equipe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-7 max-h-[82vh] overflow-y-auto">
          
          {/* 1. Shop Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>1. Identidade da Barbearia</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da Barbearia *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Slogan ou Frase de Efeito</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  WhatsApp Oficial da Barbearia *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  placeholder="5511999998888"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-neutral-500" />
                  Chave PIX (para Recibos)
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CNPJ, E-mail ou Telefone"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Images (Exclusively via Gallery File Upload) */}
          <div className="space-y-4 pt-5 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>2. Imagens da Barbearia (Galeria)</span>
              </h4>
              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
                Carregar somente da galeria
              </span>
            </div>

            {/* Logo from Gallery */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Logo Oficial da Barbearia
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo da Barbearia" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-neutral-600" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="shop-logo-file-input"
                  />
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carregar Logo da Galeria</span>
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Formatos suportados: PNG, JPG, WEBP. Selecione o arquivo diretamente da sua galeria de fotos.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner / Cover from Gallery */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Imagem de Capa (Banner Principal)
              </label>

              <div className="space-y-3">
                <div className="w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 relative flex items-center justify-center shadow-inner">
                  {coverUrl ? (
                    <img 
                      src={coverUrl} 
                      alt="Banner da Barbearia" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-neutral-600 flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Nenhuma foto de capa selecionada</span>
                    </div>
                  )}
                  {coverUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-[11px] font-bold text-white/90">Pré-visualização da Capa</span>
                    </div>
                  )}
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  id="shop-cover-file-input"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Capa da Galeria</span>
                  </button>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}
                  <span className="text-[11px] text-neutral-500">
                    Recomendado: foto horizontal da fachada ou do salão da barbearia.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Working Hours & Lunch Break */}
          <div className="space-y-4 pt-5 border-t border-neutral-800">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>3. Horários & Intervalo para Almoço</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Horário de Abertura:</label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Horário de Fechamento:</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Intervalo dos Horários:</label>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                </select>
              </div>
            </div>

            {/* Lunch Break Configuration */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Pausa para Almoço / Intervalo</span>
                    <span className="text-[10px] text-neutral-400">Bloqueia automaticamente este período na agenda de clientes</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lunchBreakEnabled}
                    onChange={(e) => setLunchBreakEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="font-semibold">{lunchBreakEnabled ? 'Ativado' : 'Desativado'}</span>
                </label>
              </div>

              {lunchBreakEnabled && (
                <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Início do Almoço:
                    </label>
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Fim do Almoço:
                    </label>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Alteração dos Dados do Administrador Logado */}
          {currentAdmin && (
            <div className="space-y-4 pt-5 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>4. Meus Dados de Administrador</span>
                </h4>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  @{currentAdmin.username}
                </span>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Nome do Administrador
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Usuário de Login (Username)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 text-xs font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                      Nova Senha (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        placeholder="Deixe em branco para não alterar"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-500 hover:text-neutral-300"
                      >
                        {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      placeholder="Repita a nova senha"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      disabled={!adminPassword}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Ao salvar este formulário, suas credenciais de acesso serão atualizadas imediatamente.
                </p>
              </div>
            </div>
          )}

          {/* 5. Cadastrar Novo Barbeiro */}
          <div className="space-y-4 pt-5 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Scissors className="w-4 h-4" />
                <span>5. Cadastrar Novo Barbeiro na Equipe</span>
              </h4>
              <span className="text-[10px] text-neutral-400">
                Total na equipe: {barbers.length}
              </span>
            </div>

            {barberError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{barberError}</span>
              </div>
            )}

            {barberSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{barberSuccess}</span>
              </div>
            )}

            <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-4">
              {/* Photo from Gallery for new barber */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Foto do Barbeiro (Carregar da Galeria):
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    {newBarberPhoto ? (
                      <img 
                        src={newBarberPhoto} 
                        alt="Prévia" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Scissors className="w-5 h-5 text-neutral-600" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={barberPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBarberPhotoUpload}
                      className="hidden"
                      id="new-barber-photo-input"
                    />
                    <button
                      type="button"
                      onClick={() => barberPhotoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{newBarberPhoto ? 'Trocar Foto da Galeria' : 'Escolher Foto da Galeria'}</span>
                    </button>
                    {newBarberPhoto && (
                      <button
                        type="button"
                        onClick={() => setNewBarberPhoto('')}
                        className="ml-2 text-xs text-rose-400 hover:text-rose-300"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Nome Completo do Barbeiro *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Matheus Oliveira"
                    value={newBarberName}
                    onChange={(e) => setNewBarberName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Fade, Navalha & Barboterapia"
                    value={newBarberSpecialty}
                    onChange={(e) => setNewBarberSpecialty(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Telefone / WhatsApp do Barbeiro
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 11988887777"
                    value={newBarberPhone}
                    onChange={(e) => setNewBarberPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Breve Bio / Apresentação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mais de 6 anos de experiência em cortes clássicos"
                    value={newBarberBio}
                    onChange={(e) => setNewBarberBio(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCreateBarber}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Barbeiro na Barbearia</span>
                </button>
              </div>

              {/* Current barbers mini preview */}
              <div className="pt-3 border-t border-neutral-800/80">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                  Barbeiros Atualmente na Equipe:
                </span>
                <div className="flex flex-wrap gap-2">
                  {barbers.map(b => (
                    <div 
                      key={b.id} 
                      className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200"
                    >
                      <img 
                        src={b.photoUrl} 
                        alt={b.name} 
                        className="w-5 h-5 rounded-full object-cover border border-neutral-700" 
                      />
                      <span className="font-semibold text-[11px]">{b.name}</span>
                      <span className="text-[10px] text-neutral-500">• {b.specialty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-neutral-800 flex items-center justify-end gap-3 sticky bottom-0 bg-neutral-900 pb-2 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
