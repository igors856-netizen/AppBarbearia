import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt as ReceiptIcon, 
  Calendar, 
  Download, 
  QrCode, 
  CreditCard, 
  Banknote, 
  Scissors, 
  Smartphone, 
  FileText, 
  Search,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { Receipt, PaymentMethod } from '../types';
import { formatCurrency, openWhatsApp, getReceiptMessage } from '../utils/whatsapp';

interface FinancialReportsProps {
  onOpenReceipt: (receipt: Receipt) => void;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ onOpenReceipt }) => {
  const { receipts, appointments, barbers } = useBarber();

  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'month'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Commission percentage setting for quick calculation (e.g. 50%)
  const [commissionRate, setCommissionRate] = useState<number>(50);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const receiptDate = r.issuedAt.split('T')[0];

      if (periodFilter === 'today' && receiptDate !== todayStr) return false;
      if (periodFilter === 'month' && !receiptDate.startsWith(currentMonthStr)) return false;

      if (methodFilter !== 'all' && r.paymentMethod !== methodFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          r.customerName.toLowerCase().includes(q) ||
          r.receiptNumber.toLowerCase().includes(q) ||
          r.barberName.toLowerCase().includes(q) ||
          r.serviceName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [receipts, periodFilter, methodFilter, searchTerm, todayStr, currentMonthStr]);

  // Summary figures
  const metrics = useMemo(() => {
    let total = 0;
    let pixTotal = 0;
    let creditTotal = 0;
    let debitTotal = 0;
    let cashTotal = 0;

    const barberBreakdown: Record<string, { count: number; total: number }> = {};

    filteredReceipts.forEach(r => {
      total += r.amount;
      if (r.paymentMethod === 'pix') pixTotal += r.amount;
      else if (r.paymentMethod === 'card_credit') creditTotal += r.amount;
      else if (r.paymentMethod === 'card_debit') debitTotal += r.amount;
      else if (r.paymentMethod === 'cash') cashTotal += r.amount;

      if (!barberBreakdown[r.barberName]) {
        barberBreakdown[r.barberName] = { count: 0, total: 0 };
      }
      barberBreakdown[r.barberName].count += 1;
      barberBreakdown[r.barberName].total += r.amount;
    });

    return { total, pixTotal, creditTotal, debitTotal, cashTotal, barberBreakdown };
  }, [filteredReceipts]);

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredReceipts.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const headers = ['Numero_Recibo', 'Data_Hora', 'Cliente', 'Telefone', 'Barbeiro', 'Servico', 'Valor_R$', 'Forma_Pagamento', 'Codigo_Auth'];
    const rows = filteredReceipts.map(r => [
      `"${r.receiptNumber}"`,
      `"${new Date(r.issuedAt).toLocaleString('pt-BR')}"`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.customerPhone}"`,
      `"${r.barberName.replace(/"/g, '""')}"`,
      `"${r.serviceName.replace(/"/g, '""')}"`,
      r.amount.toFixed(2),
      `"${r.paymentMethod}"`,
      `"${r.authCode}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-financeiro-barberpro-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Financeiro & Comprovantes</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 pl-11">
              Controle de caixa, faturamento por forma de pagamento, comissões de barbeiros e emissão de recibos digitais
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Exportar Planilha (CSV)</span>
            </button>
          </div>
        </div>

        {/* Big Totals Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Total Faturado</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatCurrency(metrics.total)}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              {filteredReceipts.length} atendimentos concluídos
            </span>
          </div>

          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Recebido via PIX</span>
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400 mt-1.5 block">
              {formatCurrency(metrics.pixTotal)}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              {metrics.total > 0 ? ((metrics.pixTotal / metrics.total) * 100).toFixed(0) : 0}% do faturamento
            </span>
          </div>

          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Cartões (Créd./Déb.)</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-amber-400 mt-1.5 block">
              {formatCurrency(metrics.creditTotal + metrics.debitTotal)}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Déb: {formatCurrency(metrics.debitTotal)} · Créd: {formatCurrency(metrics.creditTotal)}
            </span>
          </div>

          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Dinheiro em Caixa</span>
              <Banknote className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-2xl font-black text-sky-400 mt-1.5 block">
              {formatCurrency(metrics.cashTotal)}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Valores em espécie
            </span>
          </div>
        </div>
      </div>

      {/* Barbers Performance & Commission Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Faturamento e Repasse por Barbeiro</h3>
          </div>

          {/* Commission selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Comissão padrão:</span>
            <select
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-amber-500"
            >
              <option value={40}>40%</option>
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={70}>70%</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(metrics.barberBreakdown) as [string, { count: number; total: number }][]).map(([barberName, data]) => {
            const commissionVal = data.total * (commissionRate / 100);
            const shopVal = data.total - commissionVal;
            return (
              <div 
                key={barberName}
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">{barberName}</h4>
                    <span className="text-[11px] text-neutral-500">{data.count} cortes realizados</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">
                    {formatCurrency(data.total)}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-900 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Comissão ({commissionRate}%):</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(commissionVal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Barbearia:</span>
                    <span className="font-bold text-neutral-300">{formatCurrency(shopVal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Receipts List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Histórico de Comprovantes Emitidos</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  periodFilter === 'all' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => setPeriodFilter('today')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  periodFilter === 'today' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  periodFilter === 'month' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Este Mês
              </button>
            </div>

            {/* Payment Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-medium focus:outline-none"
            >
              <option value="all">Todas Formas</option>
              <option value="pix">PIX</option>
              <option value="card_credit">Crédito</option>
              <option value="card_debit">Débito</option>
              <option value="cash">Dinheiro</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente ou recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">Nº Recibo</th>
                <th className="pb-3 font-semibold">Data / Hora</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Profissional</th>
                <th className="pb-3 font-semibold">Serviço</th>
                <th className="pb-3 font-semibold">Forma</th>
                <th className="pb-3 font-semibold text-right">Valor</th>
                <th className="pb-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    Nenhum comprovante registrado para este período.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-950/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-white">{r.receiptNumber}</td>
                    <td className="py-3 text-neutral-400">
                      {new Date(r.issuedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 font-semibold text-neutral-200">{r.customerName}</td>
                    <td className="py-3 text-amber-400 font-medium">{r.barberName}</td>
                    <td className="py-3 text-neutral-300">{r.serviceName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-300">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenReceipt(r)}
                          title="Visualizar Comprovante"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openWhatsApp(r.customerPhone, getReceiptMessage(r))}
                          title="Reenviar pelo WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
