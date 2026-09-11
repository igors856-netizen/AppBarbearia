import React, { useState } from 'react';
import { 
  Sparkles, 
  Scissors, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Phone, 
  User, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Service, Barber } from '../types';
import { formatCurrency } from '../utils/whatsapp';

export const ServiceBarberManagement: React.FC = () => {
  const { 
    services, 
    addService, 
    updateService, 
    deleteService, 
    barbers, 
    addBarber, 
    updateBarber, 
    deleteBarber,
    isSuperUser 
  } = useBarber();

  const [activeTab, setActiveTab] = useState<'services' | 'barbers'>(isSuperUser ? 'services' : 'barbers');

  // Service form state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState(45);
  const [serviceDuration, setServiceDuration] = useState(30);
  const [serviceCategory, setServiceCategory] = useState<Service['category']>('cabelo');

  // Barber form state
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState('');
  const [barberSpecialty, setBarberSpecialty] = useState('');
  const [barberPhone, setBarberPhone] = useState('');
  const [barberBio, setBarberBio] = useState('');
  const [barberPhotoUrl, setBarberPhotoUrl] = useState('');
  const [barberActive, setBarberActive] = useState(true);

  // Form toggles
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showBarberForm, setShowBarberForm] = useState(false);

  // Handle Service Submit
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperUser || !serviceName.trim()) return;

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        category: serviceCategory
      });
      setEditingServiceId(null);
    } else {
      addService({
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        category: serviceCategory
      });
    }

    // Reset
    setServiceName('');
    setServiceDescription('');
    setServicePrice(45);
    setServiceDuration(30);
    setShowServiceForm(false);
  };

  const handleEditService = (s: Service) => {
    if (!isSuperUser) return;
    setEditingServiceId(s.id);
    setServiceName(s.name);
    setServiceDescription(s.description);
    setServicePrice(s.price);
    setServiceDuration(s.durationMinutes);
    setServiceCategory(s.category);
    setShowServiceForm(true);
  };

  // Handle Barber Submit
  const handleBarberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName.trim()) return;

    if (editingBarberId) {
      updateBarber(editingBarberId, {
        name: barberName.trim(),
        specialty: barberSpecialty.trim(),
        phone: barberPhone.trim(),
        bio: barberBio.trim(),
        photoUrl: barberPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        active: barberActive
      });
      setEditingBarberId(null);
    } else {
      addBarber({
        name: barberName.trim(),
        specialty: barberSpecialty.trim(),
        phone: barberPhone.trim(),
        bio: barberBio.trim(),
        photoUrl: barberPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        active: barberActive
      });
    }

    setBarberName('');
    setBarberSpecialty('');
    setBarberPhone('');
    setBarberBio('');
    setBarberPhotoUrl('');
    setShowBarberForm(false);
  };

  const handleEditBarber = (b: Barber) => {
    setEditingBarberId(b.id);
    setBarberName(b.name);
    setBarberSpecialty(b.specialty);
    setBarberPhone(b.phone);
    setBarberBio(b.bio);
    setBarberPhotoUrl(b.photoUrl);
    setBarberActive(b.active);
    setShowBarberForm(true);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Tab Toggle */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Catálogo de Serviços & Barbeiros</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 pl-11">
            Cadastre os preços, tempo de execução dos procedimentos e os profissionais da sua barbearia
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Serviços ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('barbers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'barbers'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Barbeiros ({barbers.length})</span>
          </button>
        </div>
      </div>

      {/* Services Tab Content */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {!isSuperUser && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
              <span>
                <strong>Catálogo Geral:</strong> A criação e alteração de preços e serviços da rede é de exclusividade do Superusuário. Como administrador da unidade, você possui permissão para cadastrar e gerenciar barbeiros na aba ao lado.
              </span>
              <button
                onClick={() => setActiveTab('barbers')}
                className="px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg whitespace-nowrap hover:bg-amber-400 transition-colors"
              >
                Ir para Barbeiros
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-300">Lista de Serviços Oferecidos</h3>
            {isSuperUser && !showServiceForm && (
              <button
                onClick={() => {
                  setEditingServiceId(null);
                  setServiceName('');
                  setServiceDescription('');
                  setShowServiceForm(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Serviço</span>
              </button>
            )}
          </div>

          {/* Service Add/Edit Modal or Box */}
          {isSuperUser && showServiceForm && (
            <form onSubmit={handleServiceSubmit} className="p-5 sm:p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="text-sm font-bold text-white">
                  {editingServiceId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Serviço *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corte Degrade Navalhado"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 capitalize"
                  >
                    <option value="cabelo">Cabelo</option>
                    <option value="barba">Barba</option>
                    <option value="combo">Combo</option>
                    <option value="estetica">Estética / Tratamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Lavagem especial, corte com máquina e navalha, finalização pomada premium"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Duração (minutos) *</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
                >
                  {editingServiceId ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          )}

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {services.map(s => (
              <div 
                key={s.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white tracking-tight">{s.name}</span>
                    <span className="text-xs font-black text-emerald-400">{formatCurrency(s.price)}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {s.durationMinutes} min
                    </span>
                    <span>•</span>
                    <span className="capitalize text-neutral-500">{s.category}</span>
                  </div>

                  {isSuperUser && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditService(s)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o serviço "${s.name}"?`)) {
                            deleteService(s.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barbers Tab Content */}
      {activeTab === 'barbers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-300">Profissionais da Barbearia</h3>
            {!showBarberForm && (
              <button
                onClick={() => {
                  setEditingBarberId(null);
                  setBarberName('');
                  setBarberSpecialty('');
                  setShowBarberForm(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Barbeiro</span>
              </button>
            )}
          </div>

          {/* Barber Add/Edit Form */}
          {showBarberForm && (
            <form onSubmit={handleBarberSubmit} className="p-5 sm:p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="text-sm font-bold text-white">
                  {editingBarberId ? 'Editar Profissional' : 'Cadastrar Novo Barbeiro'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowBarberForm(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Barbeiro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Santos"
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Especialidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Visagismo, Corte Clássico & Fade"
                    value={barberSpecialty}
                    onChange={(e) => setBarberSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: 5511999998888"
                    value={barberPhone}
                    onChange={(e) => setBarberPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">URL da Foto</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={barberPhotoUrl}
                    onChange={(e) => setBarberPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Mini Biografia</label>
                <input
                  type="text"
                  placeholder="Ex: 8 anos de experiência em cortes tradicionais e modernos"
                  value={barberBio}
                  onChange={(e) => setBarberBio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={barberActive}
                    onChange={(e) => setBarberActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 border-neutral-700 bg-neutral-900"
                  />
                  <span className="text-xs font-semibold text-neutral-300">Ativo na grade de agendamentos</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowBarberForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
                >
                  {editingBarberId ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}
                </button>
              </div>
            </form>
          )}

          {/* Barber Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbers.map(b => (
              <div 
                key={b.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-4 shadow-md"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0 relative">
                  <img 
                    src={b.photoUrl} 
                    alt={b.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate">{b.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                    }`}>
                      {b.active ? 'Ativo' : 'Pausa'}
                    </span>
                  </div>

                  <p className="text-xs text-amber-400 font-medium truncate mt-0.5">{b.specialty}</p>
                  <p className="text-[11px] text-neutral-400 truncate mt-1">{b.bio}</p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] text-neutral-500 font-mono">{b.phone}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditBarber(b)}
                        className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o barbeiro "${b.name}"?`)) {
                            deleteBarber(b.id);
                          }
                        }}
                        className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
