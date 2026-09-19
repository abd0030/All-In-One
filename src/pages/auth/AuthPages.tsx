import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Package, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/ui';
import { userHasAnyRole } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

// ============================================================
// LOGIN PAGE
// ============================================================
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { signIn, signInWithOtp, signInWithGoogle, refreshUser, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  
  const queryRedirect = searchParams.get('redirect');
  const from = (location.state as { from?: string })?.from || queryRedirect;

  const getRedirectPath = (returnedUser: typeof user | null) => {
    if (!returnedUser) return '/';
    if (userHasAnyRole(returnedUser, ['super_admin'])) return '/superadmin';
    if (userHasAnyRole(returnedUser, ['admin'])) return '/admin';
    if (userHasAnyRole(returnedUser, ['moderator'])) return '/moderator';
    return '/';
  };

  const redirectAfterLogin = async () => {
    const updatedUser = await refreshUser();
    const currentUser = updatedUser ?? user;
    const redirectTarget = (from && !['/login', '/register', '/forgot-password'].includes(from))
      ? from
      : getRedirectPath(currentUser);
    navigate(redirectTarget, { replace: true });
  };

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const getAuthErrorMessage = (err: any) => {
    if (!err) return 'Authentication failed';
    if (typeof err === 'string') return err;
    return err.message || err.error_description || err.details || 'Authentication failed';
  };

  const onSubmit = async (data: LoginData) => {
    try {
      await signIn(data.email, data.password);
      
      // Fetch user profile and verify role
      const currentUser = await refreshUser();
      if (currentUser && userHasAnyRole(currentUser, ['admin', 'super_admin'])) {
        await signOut();
        toast.error('Access Denied: Please sign in from the dedicated admin login page.');
        return;
      }
      if (currentUser && userHasAnyRole(currentUser, ['moderator'])) {
        await signOut();
        toast.error('Access Denied: Please sign in from the dedicated moderator login page.');
        return;
      }

      toast.success('Welcome back!');
      await redirectAfterLogin();
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number; error_description?: string };
      const message = error.message || error.error_description || 'Invalid email or password';

      // If unverified — redirect to OTP page and resend code automatically
      if (/verify your email|not confirm/i.test(message)) {
        toast.error('Please verify your email first. Sending a new verification code...');
        try {
          const { error: resendErr } = await supabase.auth.resend({ type: 'signup', email: data.email });
          if (!resendErr) toast.success('Verification code sent! Check your inbox.');
        } catch { /* ignore */ }
        navigate('/verify-otp', { state: { email: data.email, type: 'signup' } });
        return;
      }

      toast.error(message);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValue = (e.target as any).email.value;
    if (!emailValue) {
      toast.error('Email is required');
      return;
    }
    const loadingToast = toast.loading('Sending verification code...');
    try {
      await signInWithOtp(emailValue);
      toast.dismiss(loadingToast);
      toast.success('One-time code sent to your email!');
      navigate('/verify-otp', { state: { email: emailValue, type: 'login' } });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to send OTP code');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message || 'Google Sign-In failed');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6 shadow-lg">
          {isOtpLogin ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                required
                autoComplete="email"
              />
              <Button type="submit" className="w-full" size="lg">
                Send OTP Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
                {...register('password')}
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting || isDemoLoading !== null}>
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsOtpLogin(!isOtpLogin)}
              className="text-xs text-primary-600 hover:underline font-semibold cursor-pointer"
            >
              {isOtpLogin ? 'Sign In with Password instead' : 'Sign In with Email OTP instead'}
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-bold">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to={queryRedirect ? `/register?redirect=${encodeURIComponent(queryRedirect)}` : '/register'}
              className="text-primary-600 hover:underline font-semibold"
            >
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// REGISTER PAGE
// ============================================================
const registerSchema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['buyer', 'seller']),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const redirectParam = searchParams.get('redirect');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await signUp(data.email, data.password, data.full_name, data.role, data.phone);
      toast.success('Account created! Please enter the verification code sent to your email.');
      navigate('/verify-otp', { state: { email: data.email, type: 'signup', redirect: redirectParam } });
    } catch (err: unknown) {
      const error = err as { message?: string };
      const message = error.message || 'Failed to create account';
      if (/already registered|already exists|duplicate/i.test(message)) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message || 'Google Sign-In failed');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">Create account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join thousands of buyers and sellers</p>
        </div>

        <div className="card p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+92 300 1234567"
              leftIcon={<Phone size={16} />}
              {...register('phone')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              hint="Must contain uppercase letter and number"
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-bold">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
              className="text-primary-600 hover:underline font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// FORGOT PASSWORD PAGE
// ============================================================
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    const loadingToast = toast.loading('Sending reset link...');
    try {
      await resetPassword(data.email);
      toast.dismiss(loadingToast);
      setSentEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset link sent!');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err?.message || 'Failed to send reset email');
    }
  };

  const handleResend = async () => {
    if (!sentEmail) return;
    const loadingToast = toast.loading('Resending reset link...');
    try {
      await resetPassword(sentEmail);
      toast.dismiss(loadingToast);
      toast.success('Reset link resent successfully!');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err?.message || 'Failed to resend reset link.');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">
            {emailSent ? "Check Your Email" : "Reset Password"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {emailSent
              ? `We sent a password reset link to ${sentEmail}`
              : "Enter your registered email to receive a password reset link"}
          </p>
        </div>

        <div className="card p-6 shadow-lg">
          {emailSent ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Please check your inbox (and spam folder) for an email with a link to reset your password. Click the link in the email to set a new password.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link to="/login" className="block w-full">
                  <Button variant="primary" className="w-full" size="lg">
                    Back to Sign In
                  </Button>
                </Link>

                <div>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline cursor-pointer"
                  >
                    Didn't receive the email? Click to resend
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Send Reset Link
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// ADMIN LOGIN PAGE
// ============================================================
export const AdminLoginPage: React.FC = () => {
  const { signIn, refreshUser, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);
  const from = (location.state as { from?: string })?.from;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam,
      password: '',
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [emailParam, setValue]);

  const getRedirectPath = (returnedUser: any) => {
    if (!returnedUser) return '/';
    if (userHasAnyRole(returnedUser, ['super_admin'])) return '/superadmin';
    if (userHasAnyRole(returnedUser, ['admin'])) return '/admin';
    return '/admin';
  };

  const getAuthErrorMessage = (err: any) => {
    if (!err) return 'Authentication failed';
    if (typeof err === 'string') return err;
    return err.message || err.error_description || err.details || 'Authentication failed';
  };

  const handleDemoSignIn = async (email: string, password: string, label: string) => {
    setIsDemoLoading(label);
    setValue('email', email);
    setValue('password', password);
    const loadingToast = toast.loading(`Connecting to demo ${label} account...`);

    try {
      await signIn(email, password);
      toast.dismiss(loadingToast);
      toast.success(`Logged in as ${label}!`);

      const currentUser = await refreshUser();
      let redirectTarget = (from && !['/login', '/register', '/forgot-password', '/login/admin'].includes(from))
        ? from
        : getRedirectPath(currentUser);

      // Force correct path for role even if redirecting "from" a wrong dashboard bookmark
      if (userHasAnyRole(currentUser, ['super_admin'])) {
        redirectTarget = '/superadmin';
      } else if (userHasAnyRole(currentUser, ['admin'])) {
        redirectTarget = '/admin';
      }

      navigate(redirectTarget, { replace: true });
      return;
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setIsDemoLoading(null);
    }
  };

  const onSubmit = async (data: LoginData) => {
    try {
      await signIn(data.email, data.password);
      
      // Fetch user profile and verify role
      const currentUser = await refreshUser();
      if (!currentUser || !userHasAnyRole(currentUser, ['admin', 'super_admin'])) {
        await signOut();
        toast.error('Access Denied: Only administrators can log in here.');
        return;
      }

      if (currentUser.is_temp_password) {
        toast.success('Welcome! Please change your temporary password.');
        navigate('/change-password', { replace: true });
        return;
      }

      toast.success('Welcome back, Admin!');
      let redirectTarget = (from && !['/login', '/register', '/forgot-password', '/login/admin'].includes(from))
        ? from
        : getRedirectPath(currentUser);

      // Force correct path for role even if redirecting "from" a wrong dashboard bookmark
      if (userHasAnyRole(currentUser, ['super_admin'])) {
        redirectTarget = '/superadmin';
      } else if (userHasAnyRole(currentUser, ['admin'])) {
        redirectTarget = '/admin';
      }

      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number; error_description?: string };
      const message = error.message || error.error_description || 'Invalid email or password';
      toast.error(message);
      console.error('Admin Login error:', error);
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
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">All in one</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in with your admin credentials</p>
        </div>

        <div className="card p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting || isDemoLoading !== null}>
              Admin Login
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// MODERATOR LOGIN PAGE
// ============================================================
export const ModeratorLoginPage: React.FC = () => {
  const { signIn, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: string })?.from;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam,
      password: '',
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: LoginData) => {
    try {
      await signIn(data.email, data.password);
      
      // Fetch user profile and verify role
      const currentUser = await refreshUser();
      if (!currentUser || !userHasAnyRole(currentUser, ['moderator'])) {
        await signOut();
        toast.error('Access Denied: Only moderators can log in here.');
        return;
      }

      if (currentUser.is_temp_password) {
        toast.success('Welcome! Please change your temporary password.');
        navigate('/change-password', { replace: true });
        return;
      }

      toast.success('Welcome back, Moderator!');
      const redirectTarget = (from && !['/login', '/register', '/forgot-password', '/login/admin', '/login/moderator'].includes(from))
        ? from
        : '/moderator';
      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number; error_description?: string };
      const message = error.message || error.error_description || 'Invalid email or password';
      toast.error(message);
      console.error('Moderator Login error:', error);
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
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">All in one</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Moderator Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in with your moderator credentials</p>
        </div>

        <div className="card p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Moderator Email"
              type="email"
              placeholder="moderator@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              Moderator Login
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
