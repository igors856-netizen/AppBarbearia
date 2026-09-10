import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt as ReceiptIcon, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Calendar, 
  Scissors, 
  User, 
  Printer, 
  MessageSquare, 
  Download,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Receipt } from '../types';
import { formatCurrency, formatDateBR, openWhatsApp, getReceiptMessage } from '../utils/whatsapp';

interface FinancialReportsProps {
  onOpenReceipt: () => void;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ onOpenReceipt }) => {
  const { appointments, receipts, setSelectedReceipt } = useBarber();

  // Current year and month
  const currentDate = new Date();
  const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [searchReceiptQuery, setSearchReceiptQuery] = useState('');

  // Generate list of available months (last 6 months)
  const availableMonths = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      list.push({ val, label });
    }
    return list;
  }, []);

  // Filter completed appointments for the selected month
  const monthAppointments = useMemo(() => {
    return appointments.filter(a => a.date.startsWith(selectedMonth));
  }, [appointments, selectedMonth]);

  const monthReceipts = useMemo(() => {
    return receipts.filter(r => r.issuedAt.startsWith(selectedMonth));
  }, [receipts, selectedMonth]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const completed = monthAppointments.filter(a => a.status === 'completed');
    const cancelled = monthAppointments.filter(a => a.status === 'cancelled');

    const totalRevenue = completed.reduce((acc, curr) => acc + curr.servicePrice, 0);
    const averageTicket = completed.length > 0 ? totalRevenue / completed.length : 0;
    const cancellationRate = monthAppointments.length > 0 
      ? (cancelled.length / monthAppointments.length) * 100 
      : 0;

    // Payment methods breakdown
    const methods = {
      pix: 0,
      card_credit: 0,
      card_debit: 0,
      cash: 0
    };

    completed.forEach(a => {
      const method = (a.paymentMethod || 'pix') as keyof typeof methods;
      if (methods[method] !== undefined) {
        methods[method] += a.servicePrice;
      }
    });

    // Top services breakdown
    const serviceMap: Record<string, { count: number; total: number; name: string }> = {};
    completed.forEach(a => {
      if (!serviceMap[a.serviceName]) {
        serviceMap[a.serviceName] = { count: 0, total: 0, name: a.serviceName };
      }
      serviceMap[a.serviceName].count += 1;
      serviceMap[a.serviceName].total += a.servicePrice;
    });

    const topServices = Object.values(serviceMap).sort((a, b) => b.total - a.total);

    // Daily revenue distribution
    const dailyMap: Record<string, number> = {};
    completed.forEach(a => {
      const day = a.date.split('-')[2];
      dailyMap[day] = (dailyMap[day] || 0) + a.servicePrice;
    });

    const dailyBars = Object.entries(dailyMap).map(([day, val]) => ({
      day,
      revenue: val
    })).sort((a, b) => Number(a.day) - Number(b.day));

    const maxDaily = Math.max(...dailyBars.map(d => d.revenue), 100);

    return {
      totalRevenue,
      averageTicket,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      totalCount: monthAppointments.length,
      cancellationRate,
      methods,
      topServices,
      dailyBars,
      maxDaily
    };
  }, [monthAppointments]);

  // Receipts search filter
  const filteredReceipts = useMemo(() => {
    if (!searchReceiptQuery.trim()) return receipts;
    const q = searchReceiptQuery.toLowerCase();
    return receipts.filter(r => 
      r.receiptNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.authCode.toLowerCase().includes(q)
    );
  }, [receipts, searchReceiptQuery]);

  const handleSendReceiptWhatsApp = (receipt: Receipt) => {
    const msg = getReceiptMessage(receipt);
    openWhatsApp(receipt.customerPhone, msg);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    onOpenReceipt();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            <span>Relatórios Financeiros & Faturamento Mensal</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão integrada de receitas, ticket médio, formas de pagamento e emissão de recibos fiscais/digitais.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white capitalize focus:outline-none focus:border-amber-500"
          >
            {availableMonths.map(m => (
              <option key={m.val} value={m.val}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Faturamento Total do Mês</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{metrics.completedCount} atendimentos faturados</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Ticket Médio por Cliente</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
            {formatCurrency(metrics.averageTicket)}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Média de consumo por agendamento
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recibos Emitidos no Mês</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {monthReceipts.length}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            100% digital com código de autenticação
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Taxa de Cancelamento</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">
            {metrics.cancellationRate.toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            {metrics.cancelledCount} cancelamentos registrados
          </div>
        </div>
      </div>

      {/* Payment Methods & Daily Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Methods Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Distribuição por Forma de Pagamento</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { id: 'pix', label: 'PIX Instantâneo', val: metrics.methods.pix, icon: QrCode, color: 'text-emerald-400', bg: 'bg-emerald-500' },
              { id: 'card_credit', label: 'Cartão de Crédito', val: metrics.methods.card_credit, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500' },
              { id: 'card_debit', label: 'Cartão de Débito', val: metrics.methods.card_debit, icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500' },
              { id: 'cash', label: 'Dinheiro em Espécie', val: metrics.methods.cash, icon: Banknote, color: 'text-amber-400', bg: 'bg-amber-500' },
            ].map(item => {
              const pct = metrics.totalRevenue > 0 ? (item.val / metrics.totalRevenue) * 100 : 0;
              const Icon = item.icon;

              return (
                <div key={item.id} className="bg-neutral-950/70 p-3 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(item.val)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Revenue Bar Visualizer */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Faturamento Diário no Mês</span>
          </h3>

          <div className="pt-4">
            {metrics.dailyBars.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
                Ainda não há registros de atendimentos faturados neste mês.
              </div>
            ) : (
              <div className="flex items-end gap-2 overflow-x-auto pb-2 h-44 px-2 scrollbar-none">
                {metrics.dailyBars.map(item => {
                  const heightPct = Math.max((item.revenue / metrics.maxDaily) * 100, 10);
                  return (
                    <div key={item.day} className="flex flex-col items-center flex-1 min-w-[36px] group">
                      <div className="text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                        {formatCurrency(item.revenue)}
                      </div>
                      <div className="w-full bg-neutral-950 rounded-lg h-32 flex items-end p-1 border border-neutral-800">
                        <div 
                          className="w-full bg-amber-500 rounded-md group-hover:bg-amber-400 transition-all shadow-sm"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 mt-1">
                        Dia {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ranking of Top Services */}
          <div className="pt-4 border-t border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 mb-3 uppercase tracking-wider">
              Serviços Mais Rentáveis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metrics.topServices.slice(0, 3).map((srv, idx) => (
                <div key={srv.name} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
                  <div className="text-[10px] text-amber-500 font-bold uppercase">#{idx + 1} Campeão</div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{srv.name}</div>
                  <div className="text-xs text-emerald-400 font-extrabold mt-1">
                    {formatCurrency(srv.total)}
                    <span className="text-[10px] font-normal text-neutral-400 ml-1.5">({srv.count}x)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Emissão Automática & Histórico de Recibos Digitais */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-amber-400" />
              <span>Emissão & Histórico de Recibos Digitais</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Recibos gerados automaticamente após cada atendimento, com envio rápido no WhatsApp e download.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar recibo, cliente ou código..."
              value={searchReceiptQuery}
              onChange={(e) => setSearchReceiptQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-10 bg-neutral-950/60 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
              Nenhum recibo encontrado. Os recibos são emitidos automaticamente ao concluir atendimentos na agenda!
            </div>
          ) : (
            filteredReceipts.map(rcpt => (
              <div
                key={rcpt.id}
                className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-amber-400">
                    <ReceiptIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{rcpt.receiptNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        {rcpt.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {rcpt.customerName} - {rcpt.serviceName}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>Barbeiro: {rcpt.barberName}</span>
                      <span>•</span>
                      <span>{new Date(rcpt.issuedAt).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-neutral-500">Hash: {rcpt.authCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right mr-2">
                    <span className="text-xs text-neutral-500 block">Total Pago</span>
                    <span className="text-base font-black text-emerald-400">{formatCurrency(rcpt.amount)}</span>
                  </div>

                  <button
                    onClick={() => handleViewReceipt(rcpt)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                    title="Visualizar recibo térmico/digital completo"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    onClick={() => handleSendReceiptWhatsApp(rcpt)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    title="Enviar recibo formatado no WhatsApp do cliente"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
