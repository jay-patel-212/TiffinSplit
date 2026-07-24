import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const {
    currentUser,
    bills,
    settings,
    markPaymentStatus,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [transactionIdInput, setTransactionIdInput] = useState('');

  const latestBill = bills[0];
  const myBillItem = latestBill?.items.find((i) => i.userId === currentUser.id);

  const amountToPay = myBillItem ? myBillItem.amount : 0;
  const isPaid = myBillItem ? myBillItem.paid : false;

  // Generate UPI URI
  // e.g. upi://pay?pa=flatowner@upi&pn=Flat+Manager&am=4640&tn=July+Tiffin+Bill
  const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
    settings.payeeName || settings.flatName
  )}&am=${amountToPay}&tn=${encodeURIComponent(
    `${latestBill ? latestBill.month : ''} Tiffin Bill`
  )}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    showToast('UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePayment = () => {
    if (!latestBill) return;

    // Trigger confetti celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    markPaymentStatus(
      latestBill.id,
      currentUser.id,
      true,
      transactionIdInput || `UPI/${Date.now().toString().slice(-8)}/Manual`
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> UPI QR Code Payment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan with GPay, PhonePe, Paytm or BHIM to settle your tiffin bill
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Payee UPI:
          </span>
          <button
            onClick={handleCopyUpi}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white transition-colors inline-flex items-center gap-1.5"
          >
            {settings.upiId} {copied ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UPI QR Display Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Scan & Pay Amount
            </span>
            <div className="text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
              {settings.currency}{amountToPay.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {myBillItem ? `${myBillItem.totalMeals} meals for ${latestBill?.month}` : 'No active bill'}
            </span>
          </div>

          {/* QR Box Container */}
          <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md my-2 relative group">
            <QRCodeSVG
              value={upiUri}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: 'https://api.iconify.design/logos:google-pay.svg',
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xs leading-relaxed">
            Scan using any UPI app or click button below to launch on mobile
          </p>

          {/* Direct Mobile App Deep-Link Buttons */}
          <div className="w-full space-y-2.5 mt-5">
            <a
              href={upiUri}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" /> Open in GPay / PhonePe / Paytm
            </a>

            <button
              onClick={handleCopyUpi}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy UPI ID ({settings.upiId})
            </button>
          </div>
        </div>

        {/* Payment Confirmation & Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold font-heading text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Payment Status ({currentUser.name})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Verify your transaction and mark your bill as paid
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Billing Period:</span>
                <span className="font-bold text-slate-900 dark:text-white">{latestBill?.month || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Tiffins:</span>
                <span className="font-bold text-slate-900 dark:text-white">{myBillItem?.totalMeals || 0} meals</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Bill Amount:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{settings.currency}{amountToPay}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> PAID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" /> PENDING
                  </span>
                )}
              </div>
            </div>

            {!isPaid ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    UPI Reference / Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionIdInput}
                    onChange={(e) => setTransactionIdInput(e.target.value)}
                    placeholder="e.g. UPI/4029102931/GPay"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleCompletePayment}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Mark Payment as Completed 🎉
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="font-extrabold">Payment Marked Completed!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Transaction Ref: {myBillItem?.transactionId || 'Confirmed'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Admin ({settings.payeeName}) verifies all received payments.
          </div>
        </div>
      </div>
    </div>
  );
};
