import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/ui';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export const VerifyOtpPage: React.FC = () => {
  const { verifyEmailOtp, signInWithOtp, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = (location.state as any)?.email || new URLSearchParams(location.search).get('email') || '';
  const type = (location.state as any)?.type || new URLSearchParams(location.search).get('type') || 'signup';

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [expiredCode, setExpiredCode] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Missing email address. Redirecting to login.');
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setVerifying(true);
    setExpiredCode(false);
    try {
      const verifyType = type === 'login' ? 'email' : (type === 'recovery' ? 'recovery' : 'signup');
      await verifyEmailOtp(email, otp, verifyType);

      // verifyEmailOtp triggers onAuthStateChange → fetchOrCreateUser → sets user state.
      // For recovery, navigate immediately. For signup/login, wait for user state.
      if (type === 'recovery') {
        toast.success('Identity verified!');
        navigate('/reset-password');
        return;
      }

      toast.success('Email verified successfully! Welcome to All In One!');

      // Give AuthContext up to 5 seconds to set the user state, then navigate
      let waited = 0;
      const targetRedirect = (location.state as any)?.redirect || new URLSearchParams(location.search).get('redirect');

      const pollForUser = setInterval(async () => {
        waited += 200;
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          clearInterval(pollForUser);
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();
          const role = profile?.role || 'buyer';
          if (targetRedirect && !['/login', '/register', '/forgot-password'].includes(targetRedirect)) {
            navigate(targetRedirect, { replace: true });
          } else if (role === 'super_admin') navigate('/superadmin', { replace: true });
          else if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'moderator') navigate('/moderator', { replace: true });
          else navigate('/', { replace: true });
        } else if (waited >= 5000) {
          clearInterval(pollForUser);
          if (targetRedirect && !['/login', '/register', '/forgot-password'].includes(targetRedirect)) {
            navigate(targetRedirect, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      }, 200);
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (/expired|invalid.*otp|otp.*expired|token.*expired/i.test(msg)) {
        setExpiredCode(true);
        toast.error('Your verification code has expired. Please request a new one.');
      } else {
        toast.error(msg || 'Invalid code. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setExpiredCode(false);
    try {
      if (type === 'login') {
        await signInWithOtp(email);
      } else {
        const { error } = await supabase.auth.resend({
          type: type === 'recovery' ? 'recovery' : 'signup',
          email
        });
        if (error) throw error;
      }
      toast.success('New verification code sent! Check your inbox.');
      setResendCooldown(60);
      setOtp('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">All in one</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verify your Email</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">We've sent a 6-digit code to</p>
          <p className="font-semibold text-primary-600 dark:text-primary-400 text-sm mt-0.5">{email}</p>
        </div>

        <div className="card p-6 shadow-lg">
          {/* Expired code warning */}
          {expiredCode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3"
            >
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Code Expired</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  This code is no longer valid. Click <strong>Resend Code</strong> below to get a new one.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setExpiredCode(false); }}
              placeholder="123456"
              leftIcon={<ShieldCheck size={16} />}
              className="text-center tracking-widest text-lg font-bold"
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={verifying} disabled={expiredCode}>
              Verify Code <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Didn't receive the code? </span>
            {resendCooldown > 0 ? (
              <span className="text-slate-400 font-medium">Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {resending && <RefreshCw size={12} className="animate-spin" />}
                <Mail size={12} />
                Resend Code
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-slate-500 hover:text-primary-600 transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
