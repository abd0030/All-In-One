import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ArrowRight, Home, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button, Spinner } from '../components/ui';
import { getApiUrl } from '../config/api';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tracker = searchParams.get('tracker');
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (!tracker) {
      setLoading(false);
      return;
    }

    const checkPayment = async () => {
      try {
        // Trigger instant backend verification with Safepay
        await fetch(getApiUrl(`/api/safepay/verify-tracker?tracker=${encodeURIComponent(tracker)}`)).catch(() => {});

        const { data } = await supabase
          .from('payments')
          .select('*, listing:listings(id, title)')
          .eq('tracker_token', tracker)
          .maybeSingle();

        setPayment(data);
      } catch (err) {
        console.error('Error fetching payment result:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPayment();

    // Realtime subscription for instant update if webhook arrives slightly after redirect
    const channel = supabase
      .channel(`payment-${tracker}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `tracker_token=eq.${tracker}`,
      }, (payload) => {
        setPayment(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tracker]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="text-primary-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Verifying Safepay Transaction...</p>
        </div>
      </div>
    );
  }

  const isSuccess = payment?.status === 'paid' || payment?.status === 'completed';
  const isFailed = payment?.status === 'failed' || payment?.status === 'cancelled';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700 space-y-6"
      >
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full mb-2">
                <Sparkles size={13} /> {payment?.package_name || 'Featured Promotion'} Active
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h2>
              <p className="text-sm text-slate-500 mt-1">Your ad promotion has been activated automatically.</p>
            </div>
            {payment?.listing && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
                <span className="text-slate-400">Promoted Listing:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{payment.listing.title}</p>
                <p className="text-emerald-600 font-semibold mt-1">PKR {payment?.amount?.toLocaleString()}</p>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Link to={payment?.listing_id ? `/listings/${payment.listing_id}` : '/dashboard/listings'}>
                <Button className="w-full" icon={<ArrowRight size={16} />}>
                  View Promoted Ad
                </Button>
              </Link>
              <Link to="/dashboard/listings">
                <Button variant="secondary" className="w-full" icon={<Home size={16} />}>
                  My Listings Dashboard
                </Button>
              </Link>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Cancelled or Failed</h2>
              <p className="text-sm text-slate-500 mt-1">No money was charged. You can try again anytime.</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/dashboard/listings">
                <Button className="w-full">Back to My Listings</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Processing...</h2>
              <p className="text-sm text-slate-500 mt-1">We are verifying your transaction with Safepay. This page will update automatically.</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/dashboard/listings">
                <Button variant="secondary" className="w-full">Return to Dashboard</Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
