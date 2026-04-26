'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Languages } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const { t, lang, toggleLang, dir, isRTL } = useLanguage();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.response?.data?.message || t.login.error);
    }
  };

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #16a085 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/3 right-16 w-40 h-40 rounded-full opacity-10 bg-white" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo area */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-blue-700 font-black text-lg">{t.brand.short}</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{t.brand.name}</p>
                <p className="text-blue-200 text-sm">{isRTL ? 'Sama Educational' : 'سما التعليمية'}</p>
              </div>
            </div>
          </div>

          {/* Center content */}
          <div className="text-white">
            <h1 className="text-5xl font-black mb-4 leading-tight">
              {isRTL ? <>منصة إدارة<br /><span className="text-teal-300">الحضانات</span></> : <><span className="text-teal-300">Nursery</span><br />Management</>}
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              {t.brand.description}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {t.login.features.map((f: string) => (
                <span key={f} className="bg-white bg-opacity-15 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div>
            <p className="text-blue-300 text-sm">{t.brand.country}</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Language toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <Languages size={15} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl shadow-lg mb-3">
              <span className="text-white font-black text-xl">{t.brand.short}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t.brand.name}</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t.login.title}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t.login.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <span>⚠️</span> {apiError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.login.email}
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: t.login.emailRequired,
                    pattern: { value: /^\S+@\S+$/i, message: t.login.emailInvalid },
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder={t.login.emailPlaceholder}
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.login.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: t.login.passwordRequired,
                      minLength: { value: 6, message: t.login.passwordMinLength },
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white pr-12"
                    placeholder={t.login.passwordPlaceholder}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1b6ca8, #16a085)' }}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> {t.login.submitting}</>
                ) : (
                  t.login.submit
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">{t.login.demoTitle}</p>
              <div className="space-y-1">
                <p className="text-xs text-blue-600">
                  {t.login.demoEmail} <span className="font-mono bg-blue-100 px-1 rounded">admin@nop.com</span>
                </p>
                <p className="text-xs text-blue-600">
                  {t.login.demoPassword} <span className="font-mono bg-blue-100 px-1 rounded">Admin@123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
