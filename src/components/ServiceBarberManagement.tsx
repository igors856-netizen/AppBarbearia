import React, { useState, useRef } from 'react';
import { 
  Scissors, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  Clock, 
  DollarSign, 
  Check, 
  Phone,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Service, Barber } from '../types';
import { formatCurrency } from '../utils/whatsapp';

export const ServiceBarberManagement: React.FC = () => {
  const { services, barbers, addService, updateService, deleteService, addBarber, updateBarber } = useBarber();

  const [activeSubTab, setActiveSubTab] = useState<'services' | 'barbers'>('services');

  // Service modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState<number>(50);
  const [srvDuration, setSrvDuration] = useState<number>(30);
  const [srvCategory, setSrvCategory] = useState<Service['category']>('cabelo');

  // Barber modal
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [barberName, setBarberName] = useState('');
  const [barberSpecialty, setBarberSpecialty] = useState('');
  const [barberPhoto, setBarberPhoto] = useState('');
  const [barberBio, setBarberBio] = useState('');
  const [barberPhone, setBarberPhone] = useState('');
  const [barberPhotoError, setBarberPhotoError] = useState<string | null>(null);

  const barberFileInputRef = useRef<HTMLInputElement>(null);

  const handleBarberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setBarberPhotoError('A foto selecionada deve ter no máximo 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setBarberPhoto(event.target.result);
          setBarberPhotoError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openNewService = () => {
    setEditingService(null);
    setSrvName('');
    setSrvDesc('');
    setSrvPrice(50);
    setSrvDuration(30);
    setSrvCategory('cabelo');
    setShowServiceModal(true);
  };

  const openEditService = (srv: Service) => {
    setEditingService(srv);
    setSrvName(srv.name);
    setSrvDesc(srv.description);
    setSrvPrice(srv.price);
    setSrvDuration(srv.durationMinutes);
    setSrvCategory(srv.category);
    setShowServiceModal(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    if (editingService) {
      updateService({
        ...editingService,
        name: srvName,
        description: srvDesc,
        price: Number(srvPrice),
        durationMinutes: Number(srvDuration),
        category: srvCategory
      });
    } else {
      addService({
        name: srvName,
        description: srvDesc,
        price: Number(srvPrice),
        durationMinutes: Number(srvDuration),
        category: srvCategory
      });
    }
    setShowServiceModal(false);
  };

  const openNewBarber = () => {
    setEditingBarber(null);
    setBarberName('');
    setBarberSpecialty('');
    setBarberPhoto('');
    setBarberBio('');
    setBarberPhone('');
    setBarberPhotoError(null);
    setShowBarberModal(true);
  };

  const openEditBarber = (b: Barber) => {
    setEditingBarber(b);
    setBarberName(b.name);
    setBarberSpecialty(b.specialty);
    setBarberPhoto(b.photoUrl);
    setBarberBio(b.bio);
    setBarberPhone(b.phone);
    setBarberPhotoError(null);
    setShowBarberModal(true);
  };

  const handleSaveBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName.trim()) return;

    const photoToSave = barberPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

    if (editingBarber) {
      updateBarber({
        ...editingBarber,
        name: barberName,
        specialty: barberSpecialty,
        photoUrl: photoToSave,
        bio: barberBio,
        phone: barberPhone
      });
    } else {
      addBarber({
        name: barberName,
        specialty: barberSpecialty,
        photoUrl: photoToSave,
        bio: barberBio,
        phone: barberPhone,
        active: true
      });
    }
    setShowBarberModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top switch bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white">Catálogo de Serviços & Equipe</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gerencie os cortes, preços, duração e profissionais disponíveis para agendamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveSubTab('services')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'services'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Serviços ({services.length})
            </button>
            <button
              onClick={() => setActiveSubTab('barbers')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'barbers'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Barbeiros ({barbers.length})
            </button>
          </div>

          <button
            onClick={activeSubTab === 'services' ? openNewService : openNewBarber}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'services' ? 'Novo Serviço' : 'Novo Barbeiro'}</span>
          </button>
        </div>
      </div>

      {/* SERVICES LIST */}
      {activeSubTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(srv => (
            <div
              key={srv.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditService(srv)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {services.length > 1 && (
                      <button
                        onClick={() => deleteService(srv.id)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-white text-base">{srv.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{srv.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {srv.durationMinutes} minutos
                </span>
                <span className="text-base font-black text-emerald-400">
                  {formatCurrency(srv.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BARBERS LIST */}
      {activeSubTab === 'barbers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-sm relative group hover:border-neutral-700 transition-colors"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditBarber(barber)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-amber-500/50 shadow-lg bg-neutral-800">
                <img 
                  src={barber.photoUrl} 
                  alt={barber.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-black text-white text-base">{barber.name}</h3>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">{barber.specialty}</p>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{barber.bio}</p>

              <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{barber.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">
              {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="Ex: Corte Degradê Navalhado"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Ex: Inclui lavagem com shampoo mentolado e acabamento na navalha."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Duração (min) *</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
                <select
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="barba">Barba</option>
                  <option value="combo">Combo</option>
                  <option value="estetica">Estética / Sobrancelha</option>
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARBER MODAL */}
      {showBarberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">
              {editingBarber ? 'Editar Barbeiro' : 'Adicionar Novo Barbeiro'}
            </h3>

            <form onSubmit={handleSaveBarber} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Barbeiro *</label>
                <input
                  type="text"
                  required
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  placeholder="Ex: Matheus Navalha"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Especialidade</label>
                <input
                  type="text"
                  value={barberSpecialty}
                  onChange={(e) => setBarberSpecialty(e.target.value)}
                  placeholder="Ex: Especialista em Barba Terapia & Fade"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Barber Photo from Gallery */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Foto do Barbeiro (Carregar da Galeria)
                </label>
                <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    {barberPhoto ? (
                      <img 
                        src={barberPhoto} 
                        alt="Foto do barbeiro" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Scissors className="w-6 h-6 text-neutral-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      ref={barberFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBarberPhotoUpload}
                      className="hidden"
                      id="barber-mgmt-photo-file-input"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => barberFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{barberPhoto ? 'Trocar Foto da Galeria' : 'Carregar Foto da Galeria'}</span>
                      </button>
                      {barberPhoto && (
                        <button
                          type="button"
                          onClick={() => setBarberPhoto('')}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500">
                      Permitido somente fotos da galeria do seu dispositivo (PNG, JPG, WEBP).
                    </p>
                  </div>
                </div>
                {barberPhotoError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{barberPhotoError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={barberPhone}
                  onChange={(e) => setBarberPhone(e.target.value)}
                  placeholder="11988887777"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Breve Apresentação</label>
                <textarea
                  rows={2}
                  value={barberBio}
                  onChange={(e) => setBarberBio(e.target.value)}
                  placeholder="Ex: Mais de 5 anos de experiência..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBarberModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
