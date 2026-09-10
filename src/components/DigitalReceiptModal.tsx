import React from 'react';
import { 
  X, 
  Printer, 
  MessageSquare, 
  Download, 
  CheckCircle2, 
  Scissors, 
  ShieldCheck, 
  Building2,
  Share2
} from 'lucide-react';
import { Receipt } from '../types';
import { formatCurrency, openWhatsApp, getReceiptMessage } from '../utils/whatsapp';

interface DigitalReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const msg = getReceiptMessage(receipt);
    openWhatsApp(receipt.customerPhone, msg);
  };

  const paymentLabels: Record<string, string> = {
    pix: 'PIX Instantâneo',
    card_credit: 'Cartão de Crédito',
    card_debit: 'Cartão de Débito',
    cash: 'Dinheiro em Espécie'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-fade-in">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Recibo Digital Emitido</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal / Paper Receipt Body */}
        <div id="digital-receipt-card" className="p-6 sm:p-8 bg-neutral-950 text-neutral-100 font-sans select-text">
          
          {/* Watermark / Header */}
          <div className="text-center pb-6 border-b border-dashed border-neutral-700">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {receipt.shopName}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              {receipt.shopAddress}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              WhatsApp: {receipt.shopPhone}
            </p>
          </div>

          {/* Receipt Info Numbers */}
          <div className="py-4 border-b border-dashed border-neutral-700 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Nº DO RECIBO:</span>
              <span className="font-bold text-amber-400">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">DATA / HORA:</span>
              <span className="text-white">{new Date(receipt.issuedAt).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">AUTENTICAÇÃO:</span>
              <span className="text-neutral-400">{receipt.authCode}</span>
            </div>
          </div>

          {/* Customer & Service Info */}
          <div className="py-4 border-b border-dashed border-neutral-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">CLIENTE:</span>
              <span className="font-bold text-white text-right">{receipt.customerName}</span>
            </div>
            {receipt.customerPhone && (
              <div className="flex justify-between">
                <span className="text-neutral-400">WHATSAPP:</span>
                <span className="text-neutral-300">{receipt.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400">BARBEIRO:</span>
              <span className="text-neutral-200">{receipt.barberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">SERVIÇO:</span>
              <span className="font-semibold text-white">{receipt.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">PAGAMENTO:</span>
              <span className="font-bold text-emerald-400">
                {paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}
              </span>
            </div>
          </div>

          {/* Big Amount */}
          <div className="pt-6 pb-2 text-center">
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">
              Valor Total Pago
            </span>
            <span className="text-3xl font-black text-emerald-400">
              {formatCurrency(receipt.amount)}
            </span>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              <span>Transação Finalizada & Confirmada</span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="mt-6 pt-4 border-t border-dashed border-neutral-700 text-center">
            <div className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
              ||| | ||||| || |||||| | |||| ||| ||||||| | ||
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 italic">
              Agradecemos a preferência! Conserve este recibo para seu controle.
            </p>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
