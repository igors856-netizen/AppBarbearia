import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Plus, 
  Check, 
  MapPin, 
  Phone, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';

interface BarbershopSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarbershopSwitcherModal: React.FC<BarbershopSwitcherModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    barbershops, 
    activeShopId, 
    switchBarbershop, 
    addBarbershop,
    currentAdmin,
    isSuperUser
  } = useBarber();

  const [showNewShopForm, setShowNewShopForm] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopSlogan, setNewShopSlogan] = useState('Tradição e Estilo para Homens Modernos');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');

  if (!isOpen) return null;

  const handleSelectShop = (shopId: string) => {
    if (!isSuperUser) return;
    switchBarbershop(shopId);
    onClose();
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperUser || !newShopName.trim()) return;

    addBarbershop({
      name: newShopName.trim(),
      slogan: newShopSlogan.trim(),
      address: newShopAddress.trim() || 'Av. Principal, 1000 - Centro',
      phoneWhatsApp: newShopPhone.trim() || '5511999998888',
      openingTime: '09:00',
      closingTime: '20:00',
      slotIntervalMinutes: 30,
      daysOpen: [1, 2, 3, 4, 5, 6],
      primaryColor: '#f59e0b',
      accentColor: '#d97706',
      logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
      coverUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1200'
    });

    setShowNewShopForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Filiais & Unidades da Rede
                </h3>
                {isSuperUser && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Superusuário
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {isSuperUser 
                  ? 'Troca de filial e cadastro de novas filiais exclusivo para o Superusuário'
                  : 'Acesso restrito ao Superusuário'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isSuperUser ? (
            <div className="text-center py-8 px-4 space-y-3 bg-neutral-950/60 rounded-2xl border border-neutral-800">
              <Store className="w-10 h-10 mx-auto text-amber-500/60" />
              <h4 className="text-sm font-bold text-white">Acesso Exclusivo para Superusuário</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                A alternância e o cadastro de novas filiais são restritos ao perfil de <strong>Superusuário</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : !showNewShopForm ? (
            <>
              <div className="space-y-2.5">
                {barbershops.map((shop) => {
                  const isSelected = shop.id === activeShopId;
                  return (
                    <div
                      key={shop.id}
                      onClick={() => handleSelectShop(shop.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0 relative">
                          <img 
                            src={shop.logoUrl} 
                            alt={shop.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{shop.name}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                                Ativa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-neutral-500" />
                            <span>{shop.address}</span>
                          </p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 flex-shrink-0 text-neutral-500" />
                            <span>{shop.phoneWhatsApp}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950">
                            <Check className="w-4 h-4 font-bold" />
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-neutral-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isSuperUser && (
                <button
                  type="button"
                  onClick={() => setShowNewShopForm(true)}
                  className="w-full flex items-center justify-center gap-2 p-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs rounded-2xl border border-dashed border-amber-500/40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Nova Filial (Somente Superusuário)</span>
                </button>
              )}
            </>
          ) : (
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome da Nova Filial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Matriz Jardins"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Slogan ou Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Especialistas em barba e cabelo clássico"
                  value={newShopSlogan}
                  onChange={(e) => setNewShopSlogan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alameda Santos, 1200 - São Paulo"
                  value={newShopAddress}
                  onChange={(e) => setNewShopAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  WhatsApp da Filial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5511999998888"
                  value={newShopPhone}
                  onChange={(e) => setNewShopPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewShopForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
                >
                  Criar Filial
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
