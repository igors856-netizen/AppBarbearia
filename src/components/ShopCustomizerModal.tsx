import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Store, 
  Clock, 
  Palette, 
  QrCode, 
  Image as ImageIcon,
  CheckCircle2,
  Save
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { BarberShopProfile } from '../types';

interface ShopCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopCustomizerModal: React.FC<ShopCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useBarber();

  const [name, setName] = useState(profile.name);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [address, setAddress] = useState(profile.address);
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(profile.phoneWhatsApp);
  const [openingTime, setOpeningTime] = useState(profile.openingTime);
  const [closingTime, setClosingTime] = useState(profile.closingTime);
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(profile.slotIntervalMinutes);
  const [lunchBreakEnabled, setLunchBreakEnabled] = useState(profile.lunchBreakEnabled ?? true);
  const [lunchStart, setLunchStart] = useState(profile.lunchStart || '12:00');
  const [lunchEnd, setLunchEnd] = useState(profile.lunchEnd || '13:00');
  const [primaryColor, setPrimaryColor] = useState(profile.primaryColor);
  const [accentColor, setAccentColor] = useState(profile.accentColor);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [pixKey, setPixKey] = useState(profile.pixKey || '');
  const [pixKeyType, setPixKeyType] = useState<BarberShopProfile['pixKeyType']>(profile.pixKeyType || 'email');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      slogan: slogan.trim(),
      address: address.trim(),
      phoneWhatsApp: phoneWhatsApp.trim(),
      openingTime,
      closingTime,
      slotIntervalMinutes: Number(slotIntervalMinutes),
      lunchBreakEnabled,
      lunchStart,
      lunchEnd,
      primaryColor,
      accentColor,
      logoUrl: logoUrl.trim(),
      coverUrl: coverUrl.trim(),
      pixKey: pixKey.trim(),
      pixKeyType
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Personalização da Barbearia</h3>
              <p className="text-xs text-neutral-400">
                Ajuste cores, dados de contato, chave PIX e horários de funcionamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Configurações salvas com sucesso! Atualizando...</span>
            </div>
          )}

          {/* Section: Identidade & Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
              <Store className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Identidade & Contato</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da Barbearia</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Slogan ou Subtítulo</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp para Notificações</label>
                <input
                  type="text"
                  required
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  placeholder="Ex: 5511999998888"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Horários e Grade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Horários e Agendamentos</h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Abertura</label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Fechamento</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Intervalo (minutos)</label>
                <select
                  value={slotIntervalMinutes}
                  onChange={(e) => setSlotIntervalMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>

            {/* Lunch Break Toggle */}
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lunchBreakEnabled}
                  onChange={(e) => setLunchBreakEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-neutral-700 bg-neutral-900"
                />
                <span className="text-xs font-semibold text-neutral-200">
                  Bloquear horário de almoço na grade
                </span>
              </label>

              {lunchBreakEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Início Almoço</label>
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Fim Almoço</label>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Pagamento PIX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Chave PIX da Barbearia</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Tipo da Chave</label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Chave PIX</label>
                <input
                  type="text"
                  placeholder="Ex: contato@barbearia.com.br ou 11999998888"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Cores e Imagens */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
              <Palette className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Cores e Imagens</h4>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Cor Primária</label>
                <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs text-neutral-300 font-mono">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Cor Secundária</label>
                <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs text-neutral-300 font-mono">{accentColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">URL do Logo</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">URL da Imagem de Capa</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
