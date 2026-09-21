import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Zap, Crown, Check, ShieldCheck, ArrowRight,
  CreditCard, Lock, Building2, Smartphone, Copy, CheckCircle2,
  UploadCloud, FileImage, AlertCircle
} from 'lucide-react';
import { Listing, PaymentAccount } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { paymentsService } from '../../services';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { getApiUrl } from '../../config/api';

interface PromoteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess?: () => void;
}

export interface PromotionPackage {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  badge: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  features: string[];
}

export const PROMOTION_PACKAGES: PromotionPackage[] = [
  {
    id: 'urgent',
    name: 'Urgent Badge',
    price: 500,
    durationDays: 7,
    badge: 'URGENT',
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-300 dark:border-amber-700',
    badgeColor: 'bg-amber-500 text-white',
    features: ['High-visibility Red Urgent Tag', 'Highlighted in Search Results', '7 Days Duration'],
  },
  {
    id: 'featured',
    name: 'Featured Ad',
    price: 1200,
    durationDays: 15,
    badge: 'FEATURED',
    icon: <Sparkles className="w-5 h-5 text-primary-500" />,
    color: 'from-primary-500/10 to-indigo-500/10 border-primary-400 dark:border-primary-600',
    badgeColor: 'bg-primary-600 text-white',
    features: ['Homepage Slider Placement', 'Top of Category Search', 'Gold Featured Badge', '15 Days Duration'],
  },
  {
    id: 'vip',
    name: 'Premium VIP',
    price: 2500,
    durationDays: 30,
    badge: 'VIP PRO',
    icon: <Crown className="w-5 h-5 text-purple-500" />,
    color: 'from-purple-500/10 to-pink-500/10 border-purple-400 dark:border-purple-600',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    features: ['#1 Top Priority Ranking', '3x More Views & Inquiries', 'Featured Banner Slider', 'Golden Crown VIP Badge', '30 Days Duration'],
  },
];

export const PromoteListingModal: React.FC<PromoteListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<PromotionPackage>(PROMOTION_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'safepay' | 'manual'>('safepay');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  
  // Manual payment form fields
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [manualNotes, setManualNotes] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadAccounts = () => {
        paymentsService.getPaymentAccounts().then((accounts) => {
          setPaymentAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedAccountId(prev => (prev && accounts.some(a => a.id === prev) ? prev : accounts[0].id));
          }
        }).catch(console.error);
      };

      loadAccounts();

      // Realtime listener for any admin changes
      const channel = supabase
        .channel('promote-accounts-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_accounts' }, () => {
          loadAccounts();
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Screenshot size should be less than 10MB');
        return;
      }
      setReceiptFile(file);
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  };

  const handleSafepayCheckout = async () => {
    if (!user) {
      toast.error('Please log in to promote your listing');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/safepay/create-tracker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          user_id: user.id,
          package_id: selectedPackage.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || 'Failed to initialize Safepay checkout');
      }

      toast.loading('Redirecting to Safepay Checkout...');
      window.location.href = data.checkout_url;
    } catch (err: any) {
      console.error('Safepay checkout error:', err);
      toast.error(err.message || 'Payment server connection failed. Please try again.');
      setLoading(false);
    }
  };

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit your payment');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('Please enter the Transaction Reference ID (TRX ID)');
      return;
    }

    if (!receiptFile) {
      toast.error('Please upload a clear screenshot of your payment receipt');
      return;
    }

    const selectedAcc = paymentAccounts.find(a => a.id === selectedAccountId);

    setLoading(true);
    try {
      await paymentsService.submitManualPayment({
        listing_id: listing.id,
        user_id: user.id,
        amount: selectedPackage.price,
        package_name: selectedPackage.name,
        duration_days: selectedPackage.durationDays,
        transaction_id: transactionId.trim(),
        receipt_file: receiptFile,
        notes: `Sender: ${senderName || user.full_name} (${senderPhone || 'N/A'}) | Account: ${selectedAcc?.bank_name || 'Manual Transfer'} | Note: ${manualNotes || 'None'}`,
      });

      setIsSuccessSubmitted(true);
      if (onSuccess) onSuccess();
      toast.success('🎉 Manual payment proof submitted successfully!');
    } catch (err: any) {
      console.error('Manual payment submission error:', err);
      toast.error(err.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Promote Your Listing</h3>
                <p className="text-xs text-primary-100 line-clamp-1">{listing.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {isSuccessSubmitted ? (
            /* Success State */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">Payment Proof Submitted!</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Your manual payment receipt for the <strong>{selectedPackage.name}</strong> (PKR {selectedPackage.price.toLocaleString()}) has been sent to our administration team.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Transaction ID: <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{transactionId}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto text-left">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  What happens next?
                </p>
                <p className="leading-relaxed">
                  Our moderators will verify the bank/wallet receipt and automatically activate your featured badge. You will receive a notification as soon as it is approved.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Step 1: Select Package */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  1. Select Promotion Package
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PROMOTION_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all bg-gradient-to-br ${pkg.color} ${
                          isSelected
                            ? 'border-primary-600 dark:border-primary-500 shadow-md ring-2 ring-primary-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {pkg.icon}
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{pkg.name}</span>
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          PKR {pkg.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {pkg.durationDays} Days Duration
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="text-primary-500 font-bold">•</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  2. Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Safepay Option */}
                  <div
                    onClick={() => setPaymentMethod('safepay')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'safepay'
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Safepay Online Checkout</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Instant activation via Visa, Mastercard, or supported digital wallets.
                      </p>
                    </div>
                  </div>

                  {/* Manual Bank / Wallet Option */}
                  <div
                    onClick={() => setPaymentMethod('manual')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'manual'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-600 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Direct Bank / EasyPaisa / JazzCash</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Manual transfer to our official bank or mobile wallet with screenshot proof.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method Details & Inputs */}
              {paymentMethod === 'safepay' ? (
                /* Safepay Info Box */
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Safepay Sandbox Hosted Checkout</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    You will be redirected securely to Safepay Checkout to complete payment using credit/debit card or supported mobile wallets.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={14} /> PCI-DSS Compliant
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock size={12} /> 256-Bit SSL Encrypted
                    </span>
                  </div>
                </div>
              ) : (
                /* Manual Transfer Account Details & Proof Upload Form */
                <form id="manual-payment-form" onSubmit={handleManualPaymentSubmit} className="space-y-4">
                  {/* Account Selector Cards */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Transfer Funds to Any of Our Official Accounts:
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {paymentAccounts.map((acc) => {
                        const isAccSelected = selectedAccountId === acc.id;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => setSelectedAccountId(acc.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isAccSelected
                                ? 'bg-amber-500/10 border-amber-500 dark:border-amber-500 ring-1 ring-amber-500/30'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {acc.account_type === 'bank' ? (
                                  <Building2 size={16} className="text-primary-500" />
                                ) : (
                                  <Smartphone size={16} className="text-emerald-500" />
                                )}
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {acc.bank_name}
                                </span>
                                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {acc.account_type}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Title: <strong>{acc.account_title}</strong>
                              </span>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="text-slate-500 text-[11px] block">Account / Mobile Number:</span>
                                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                                  {acc.account_number}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(acc.account_number, `acc-${acc.id}`);
                                }}
                                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                {copiedField === `acc-${acc.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                <span>{copiedField === `acc-${acc.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            {acc.iban && (
                              <div className="mt-2 flex items-center justify-between gap-2 text-xs bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                                <div className="truncate">
                                  <span className="text-slate-400 text-[10px] block">IBAN:</span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{acc.iban}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(acc.iban || '', `iban-${acc.id}`);
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold text-primary-600 hover:underline shrink-0"
                                >
                                  Copy IBAN
                                </button>
                              </div>
                            )}

                            {acc.instructions && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
                                💡 {acc.instructions}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sender Details Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-amber-500" />
                      Enter Your Payment Proof Details
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Sender Full Name / Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g. Muhammad Ali"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Sender Phone / Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="e.g. 03001234567"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Transaction ID / Reference Number (TRX ID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. TRX-9823471029 or 12-digit EasyPaisa/JazzCash TID"
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Upload Payment Receipt / Transfer Screenshot *
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors bg-white dark:bg-slate-900">
                        {receiptPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="max-h-36 rounded-xl object-contain border border-slate-200 dark:border-slate-700 mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block space-y-2">
                            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              <span className="text-primary-600 dark:text-primary-400 font-bold underline">Click to upload</span> or drag and drop
                            </div>
                            <p className="text-[10px] text-slate-400">PNG, JPG, JPEG up to 10MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="Any special remarks or transfer notes"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* Total Summary & Submit Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500">Total Payable:</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    PKR {selectedPackage.price.toLocaleString()}
                  </div>
                </div>

                {paymentMethod === 'safepay' ? (
                  <button
                    type="button"
                    onClick={handleSafepayCheckout}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Initializing...' : 'Proceed to Safepay Checkout'}</span>
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="manual-payment-form"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting Receipt...' : 'Submit Payment Proof'}</span>
                    <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
