import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle, 
  Scissors, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { Receipt } from '../types';
import { openWhatsApp, getReceiptMessage, formatCurrency } from '../utils/whatsapp';

interface DigitalReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const paymentLabels: Record<string, string> = {
    pix: 'PIX Instantâneo',
    card_credit: 'Cartão de Crédito',
    card_debit: 'Cartão de Débito',
    cash: 'Dinheiro'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const msg = getReceiptMessage(receipt);
    openWhatsApp(receipt.customerPhone, msg);
  };

  const handleCopyText = () => {
    const msg = getReceiptMessage(receipt);
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Comprovante Digital</h3>
              <p className="text-[11px] text-neutral-400">Nº {receipt.receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir Comprovante"
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyText}
              title="Copiar texto do comprovante"
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 overflow-y-auto bg-neutral-950 flex justify-center">
          <div 
            ref={receiptRef}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            {/* Watermark/Accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Shop Brand Header */}
            <div className="text-center pb-4 border-b border-dashed border-neutral-800">
              <h2 className="text-lg font-extrabold text-white tracking-tight">{receipt.shopName}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{receipt.shopAddress}</p>
              <p className="text-xs text-neutral-400 mt-0.5">WhatsApp: {receipt.shopPhone}</p>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Número:</span>
                <span className="font-mono font-bold text-white">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Emissão:</span>
                <span className="text-neutral-200">
                  {new Date(receipt.issuedAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Cliente:</span>
                <span className="font-semibold text-white">{receipt.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Telefone:</span>
                <span className="text-neutral-300">{receipt.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Profissional:</span>
                <span className="font-semibold text-amber-400">{receipt.barberName}</span>
              </div>
            </div>

            {/* Service & Price */}
            <div className="py-3.5 border-t border-b border-dashed border-neutral-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white">{receipt.serviceName}</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Forma de Pagamento:</span>
                <span className="font-medium text-neutral-300">
                  {paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-4 pb-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Total Pago</span>
              <span className="text-xl font-extrabold text-white">
                {formatCurrency(receipt.amount)}
              </span>
            </div>

            {/* Status & Security Seal */}
            <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PAGAMENTO CONFIRMADO</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-500 uppercase">
                Autenticação: {receipt.authCode}
              </p>
              <p className="text-[10px] text-neutral-500 mt-2">
                Obrigado pela preferência! Guarde este comprovante digital.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para Área de Transferência' : 'Copiar Texto do Recibo'}</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Enviar Recibo via WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
