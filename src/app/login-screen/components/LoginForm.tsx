'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Copy, Check, Lock, Mail, AlertCircle } from 'lucide-react';
import { signInAdmin } from '@/lib/auth';
import { toast } from 'sonner';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '', remember: false } });

  const handleCopy = (field: 'email' | 'password', value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      if (field === 'email') setValue('email', value);
      if (field === 'password') setValue('password', value);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const fillCredentials = () => {
    setValue('email', 'mnskaho@gmail.com');
    setValue('password', 'Mnskaho@');
  };

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    const result = await signInAdmin(data.email, data.password);
    if (result.success) {
      toast.success('Welcome back, Admin');
      router.push('/dashboard');
    } else {
      setServerError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(190_95%_70%/0.1)] border border-[hsl(190_95%_70%/0.2)] mb-5">
          <Lock size={11} className="text-[hsl(var(--primary))]" />
          <span className="text-[11px] font-semibold text-[hsl(var(--primary))] tracking-wide uppercase">
            Admin Access
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1.5">Sign in to NeuroSpace</h2>
        <p className="text-[13.5px] text-[hsl(var(--muted-foreground))]">
          Restricted to authorized administrators only.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-3 p-3.5 mb-5 rounded-lg bg-[hsl(0_72%_51%/0.1)] border border-[hsl(0_72%_51%/0.25)] animate-fade-in">
          <AlertCircle size={16} className="text-[hsl(var(--destructive))] flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-[hsl(0_72%_65%)]">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-[hsl(var(--foreground))] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className={`w-full bg-[hsl(var(--card))] border rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all duration-150 ${
                errors.email ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))]'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[12px] text-[hsl(var(--destructive))]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-[hsl(var(--foreground))] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full bg-[hsl(var(--card))] border rounded-lg pl-10 pr-11 py-2.5 text-[14px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all duration-150 ${
                errors.password ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))]'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[12px] text-[hsl(var(--destructive))]">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--card))] accent-[hsl(var(--primary))]"
            {...register('remember')}
          />
          <label htmlFor="remember" className="text-[13px] text-[hsl(var(--muted-foreground))]">
            Keep me signed in
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(190_95%_65%)] text-[hsl(var(--background))] font-semibold text-[14px] transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        >
          {isSubmitting ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <>
              <Lock size={15} />
              Sign In Securely
            </>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-7 p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Demo Admin Credentials
          </p>
          <button
            type="button"
            onClick={fillCredentials}
            className="text-[11px] font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Autofill
          </button>
        </div>
        <div className="space-y-2">
          {/* Email row */}
          <div className="flex items-center justify-between bg-[hsl(var(--muted))] rounded-lg px-3 py-2">
            <div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-0.5">Email</p>
              <p className="text-[12px] font-mono text-[hsl(var(--foreground))]">mnskaho@gmail.com</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('email', 'mnskaho@gmail.com')}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              aria-label="Copy email"
            >
              {copiedField === 'email' ? <Check size={14} className="text-[hsl(var(--positive))]" /> : <Copy size={14} />}
            </button>
          </div>
          {/* Password row */}
          <div className="flex items-center justify-between bg-[hsl(var(--muted))] rounded-lg px-3 py-2">
            <div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-0.5">Password</p>
              <p className="text-[12px] font-mono text-[hsl(var(--foreground))]">Mnskaho@</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('password', 'Mnskaho@')}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              aria-label="Copy password"
            >
              {copiedField === 'password' ? <Check size={14} className="text-[hsl(var(--positive))]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
