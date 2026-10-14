import { FormEvent, useState } from 'react';
import { Baby, KeyRound, Loader2, LogIn, ShoppingBag, Sparkles, User as UserIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'parent' | 'child';
type ParentForm = 'login' | 'register';

export default function LoginScreen() {
  const { loginParent, registerParent, loginChild } = useAuth();
  const [mode, setMode] = useState<Mode>('parent');
  const [parentForm, setParentForm] = useState<ParentForm>('login');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'child') {
        if (!accessKey.trim()) throw new Error('Введите ключ доступа');
        await loginChild(accessKey);
      } else if (parentForm === 'login') {
        if (!email.trim() || !password) throw new Error('Заполните email и пароль');
        await loginParent(email, password);
      } else {
        if (!name.trim() || !email.trim() || !password) throw new Error('Заполните все поля');
        await registerParent(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-3xl font-extrabold">Семейный магазин</h1>
          <p className="mt-1 text-sm text-white/80">Магазин с внутренней валютой для детей</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setMode('parent')}
              className={`tab-btn justify-center ${mode === 'parent' ? 'tab-active' : 'tab-inactive'}`}
            >
              <UserIcon size={18} /> Родитель
            </button>
            <button
              type="button"
              onClick={() => setMode('child')}
              className={`tab-btn justify-center ${mode === 'child' ? 'tab-active' : 'tab-inactive'}`}
            >
              <Baby size={18} /> Ребенок
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'child' ? (
              <>
                <div>
                  <label className="label">Ключ доступа</label>
                  <input
                    className="input text-center font-bold uppercase tracking-widest"
                    placeholder="XXXX-XXXX-XXXX"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <KeyRound size={18} /> Войти в магазин
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
                  <Sparkles size={14} /> Ключ выдаёт родитель в разделе «Дети»
                </p>
              </>
            ) : (
              <>
                {parentForm === 'register' && (
                  <div>
                    <label className="label">Имя</label>
                    <input
                      className="input"
                      placeholder="Как вас зовут?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Пароль</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : parentForm === 'login' ? (
                    <>
                      <LogIn size={18} /> Войти
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Зарегистрироваться
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {mode === 'parent' && (
            <button
              type="button"
              onClick={() => {
                setParentForm(parentForm === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {parentForm === 'login' ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}