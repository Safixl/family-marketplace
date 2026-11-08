import { FormEvent, useEffect, useState } from 'react';
import { Baby, KeyRound, Loader2, LogIn, Mail, ShieldQuestion, User as UserIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

type Mode = 'parent' | 'child';
type ParentForm = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

/**
 * Стартовый экран в стиле WoW Classic: тёмный каменный фон, золотые рамки,
 * шрифт с засечками. Поддерживает вход родителя/ребёнка, регистрацию
 * с подтверждением e-mail кодом и сброс пароля по ссылке из письма.
 */
export default function LoginScreen() {
  const { loginParent, registerParent, verifyParent, loginChild } = useAuth();

  // Токен сброса из ссылки в письме: /reset-password?token=...
  const [resetToken] = useState(() => {
    const t = new URLSearchParams(window.location.search).get('token');
    return t;
  });

  const [mode, setMode] = useState<Mode>('parent');
  const [parentForm, setParentForm] = useState<ParentForm>(resetToken ? 'reset' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const resetForms = () => {
    setError(null);
    setInfo(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'child') {
        if (!accessKey.trim()) throw new Error('Введите ключ доступа');
        await loginChild(accessKey);
        return;
      }
      switch (parentForm) {
        case 'login': {
          if (!email.trim() || !password) throw new Error('Заполните email и пароль');
          await loginParent(email, password);
          return;
        }
        case 'register': {
          if (!name.trim() || !email.trim() || !password) throw new Error('Заполните все поля');
          if (password.length < 6) throw new Error('Пароль должен быть от 6 символов');
          const res = await registerParent(name, email, password);
          if (res.needsVerification) {
            setParentForm('verify');
            setResendIn(30);
            setInfo(`Аккаунт создан! Код подтверждения отправлен на ${email}`);
          }
          return;
        }
        case 'verify': {
          if (!code.trim()) throw new Error('Введите код из письма');
          await verifyParent(email, code);
          return;
        }
        case 'forgot': {
          if (!email.trim()) throw new Error('Укажите email');
          const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
          setInfo(res.message);
          return;
        }
        case 'reset': {
          if (!resetToken) throw new Error('Ссылка недействительна — откройте свежую ссылку из письма');
          if (!password || password.length < 6) throw new Error('Пароль должен быть от 6 символов');
          const res = await api.post<{ message: string }>('/auth/reset-password', { token: resetToken, password });
          setInfo(res.message);
          setParentForm('login');
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    setError(null);
    setBusy(true);
    try {
      await api.post('/auth/resend-code', { email });
      setResendIn(30);
      setInfo('Новый код отправлен на почту');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить код');
    } finally {
      setBusy(false);
    }
  };

  const switchForm = (f: ParentForm) => {
    setParentForm(f);
    resetForms();
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(180,83,9,0.25), transparent 60%),' +
          'radial-gradient(ellipse at 20% 80%, rgba(120,53,15,0.2), transparent 55%),' +
          'linear-gradient(160deg, #17130e 0%, #14100c 45%, #0c0a07 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl"
            style={{ borderColor: '#b45309', color: '#fbbf24', background: 'rgba(120,53,15,0.25)' }}
          >
            ⚔️
          </div>
          <h1
            className="text-4xl font-bold tracking-wider"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(180deg,#fde68a 0%,#f59e0b 55%,#b45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}
          >
            ДЕЙЛИКИ
          </h1>
          <p className="mt-2 text-sm text-amber-200/60" style={{ fontFamily: 'Georgia, serif' }}>
            OFF-RPG · Прокача навыков ребенка · Играй и развивай
          </p>
        </div>

        {/* Панель с двойной золотой рамкой */}
        <div
          className="rounded-2xl p-[3px]"
          style={{ background: 'linear-gradient(180deg,#b45309,#78350f 60%,#4a2f12)' }}
        >
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(34,26,18,0.97), rgba(20,16,12,0.98))',
              border: '1px solid rgba(217,119,6,0.35)',
              boxShadow: 'inset 0 1px 0 rgba(251,191,36,0.12), 0 24px 60px rgba(0,0,0,0.65)',
            }}
          >
            {/* Табы Родитель / Ребёнок */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              <WowTab active={mode === 'parent'} onClick={() => { setMode('parent'); switchForm('login'); }} icon={<UserIcon size={16} />} label="Родитель" />
              <WowTab active={mode === 'child'} onClick={() => { setMode('child'); resetForms(); }} icon={<Baby size={16} />} label="Ребёнок" />
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-800/60 bg-rose-950/50 px-4 py-2.5 text-sm text-rose-200">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2.5 text-sm text-amber-200">
                {info}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'child' ? (
                <>
                  <WowField label="Ключ доступа">
                    <input
                      className="w-full rounded-lg border border-amber-900/60 bg-black/40 px-3.5 py-2.5 text-center font-bold uppercase tracking-widest text-amber-100 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-700/50"
                      placeholder="XXXX-XXXX-XXXX"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      autoFocus
                    />
                  </WowField>
                  <WowButton disabled={busy} icon={busy ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />} label="Войти в мир" />
                  <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-amber-200/40">
                    <ShieldQuestion size={14} /> Ключ выдаёт родитель в разделе «Дети»
                  </p>
                </>
              ) : (
                <>
                  {parentForm === 'register' && (
                    <WowField label="Имя героя">
                      <input
                        className={wowInputCls}
                        placeholder="Как вас зовут?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                      />
                    </WowField>
                  )}

                  {(parentForm === 'login' || parentForm === 'register' || parentForm === 'forgot') && (
                    <WowField label="Email">
                      <input
                        className={wowInputCls}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus={parentForm !== 'register'}
                      />
                    </WowField>
                  )}

                  {(parentForm === 'login' || parentForm === 'register' || parentForm === 'reset') && (
                    <WowField label={parentForm === 'reset' ? 'Новый пароль' : 'Пароль'}>
                      <input
                        className={wowInputCls}
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus={parentForm === 'reset'}
                      />
                    </WowField>
                  )}

                  {parentForm === 'verify' && (
                    <WowField label={`Код из письма (отправлен на ${email})`}>
                      <input
                        className={`${wowInputCls} text-center text-2xl font-bold tracking-[0.5em]`}
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                      />
                    </WowField>
                  )}

                  {parentForm === 'verify' && (
                    <WowButton
                      disabled={busy || code.length < 6}
                      icon={busy ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                      label="Подтвердить и войти"
                    />
                  )}
                  {parentForm !== 'verify' && (
                    <WowButton
                      disabled={busy}
                      icon={busy ? <Loader2 className="animate-spin" size={18} /> : (
                        parentForm === 'login' ? <LogIn size={18} />
                          : parentForm === 'register' ? <UserPlus size={18} />
                            : parentForm === 'forgot' ? <Mail size={18} />
                              : <KeyRound size={18} />
                      )}
                      label={
                        parentForm === 'login' ? 'Войти'
                          : parentForm === 'register' ? 'Зарегистрироваться'
                            : parentForm === 'forgot' ? 'Отправить ссылку сброса'
                              : 'Сменить пароль'
                      }
                    />
                  )}

                  {parentForm === 'verify' && (
                    <button
                      type="button"
                      disabled={resendIn > 0 || busy}
                      onClick={() => void resend()}
                      className="w-full text-center text-xs text-amber-200/60 transition hover:text-amber-200 disabled:opacity-50"
                    >
                      {resendIn > 0 ? `Отправить код повторно через ${resendIn} с` : 'Отправить код повторно'}
                    </button>
                  )}
                </>
              )}
            </form>

            {/* Ссылки переключения форм */}
            {mode === 'parent' && (
              <div className="mt-5 space-y-1 text-center text-sm">
                {parentForm === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchForm('register')}
                      className="block w-full font-semibold text-amber-500/90 transition hover:text-amber-300"
                    >
                      Нет аккаунта? Зарегистрироваться
                    </button>
                    <button
                      type="button"
                      onClick={() => switchForm('forgot')}
                      className="block w-full text-xs text-amber-200/40 transition hover:text-amber-200/80"
                    >
                      Забыли пароль?
                    </button>
                  </>
                )}
                {parentForm !== 'login' && parentForm !== 'verify' && (
                  <button
                    type="button"
                    onClick={() => switchForm('login')}
                    className="block w-full font-semibold text-amber-500/90 transition hover:text-amber-300"
                  >
                    Уже есть аккаунт? Войти
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-amber-200/25" style={{ fontFamily: 'Georgia, serif' }}>
          ⚔️ Да будет подвиг
        </p>
      </div>
    </div>
  );
}

const wowInputCls =
  'w-full rounded-lg border border-amber-900/60 bg-black/40 px-3.5 py-2.5 text-sm text-amber-100 outline-none transition placeholder:text-amber-200/30 focus:border-amber-600 focus:ring-2 focus:ring-amber-700/50';

function WowTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'border-amber-600/70 bg-amber-900/30 text-amber-200'
          : 'border-stone-700/60 bg-black/30 text-stone-400 hover:border-amber-800/50 hover:text-amber-200/70'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function WowField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-200/60"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function WowButton({ disabled, icon, label }: { disabled: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600/70 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-amber-100 transition hover:border-amber-500 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'linear-gradient(180deg, rgba(180,83,9,0.45), rgba(120,53,15,0.55))',
        fontFamily: 'Georgia, serif',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      }}
    >
      {icon} {label}
    </button>
  );
}
