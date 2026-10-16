import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Copy, Gift, KeyRound, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, WishlistItemDto } from '../../api/types';
import { errMsg, fmtDate } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface FormState {
  name: string;
  avatarEmoji: string;
  active: boolean;
  age: string;
}

const EMPTY_FORM: FormState = { name: '', avatarEmoji: '😊', active: true, age: '' };

export default function ChildrenTab() {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ChildDto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [wishlists, setWishlists] = useState<Record<number, WishlistItemDto[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      setChildren(list);
      await Promise.all(
        list.map(async (child) => {
          try {
            const items = await api.get<WishlistItemDto[]>(`/parent/children/${child.id}/wishlist`);
            setWishlists((prev) => ({ ...prev, [child.id]: items }));
          } catch {
            // вишлист недоступен — пропускаем
          }
        })
      );
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (child: ChildDto) => {
    setEditing(child);
    setForm({
      name: child.name,
      avatarEmoji: child.avatarEmoji,
      active: child.active,
      age: child.age != null ? String(child.age) : '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert('Укажите имя');
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        avatarEmoji: form.avatarEmoji.trim() || '😊',
        active: form.active,
        age: form.age ? Number(form.age) : null,
      };
      if (editing) {
        await api.put(`/parent/children/${editing.id}`, body);
      } else {
        await api.post('/parent/children', body);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async (child: ChildDto) => {
    if (!window.confirm('Сгенерировать новый ключ? Старый ключ перестанет работать.')) return;
    try {
      const updated = await api.post<ChildDto>(`/parent/children/${child.id}/regenerate-key`);
      setChildren((prev) => prev.map((c) => (c.id === child.id ? updated : c)));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const toggleActive = async (child: ChildDto) => {
    try {
      const updated = await api.put<ChildDto>(`/parent/children/${child.id}`, {
        name: child.name,
        avatarEmoji: child.avatarEmoji,
        active: !child.active,
      });
      setChildren((prev) => prev.map((c) => (c.id === child.id ? updated : c)));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const remove = async (child: ChildDto) => {
    if (!window.confirm(`Удалить ребенка «${child.name}»? Все его данные будут удалены.`)) return;
    try {
      await api.del(`/parent/children/${child.id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const copyKey = async (child: ChildDto) => {
    try {
      await navigator.clipboard.writeText(child.accessKey);
      setCopiedId(child.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // буфер недоступен
    }
  };

  const markWishDone = async (item: WishlistItemDto) => {
    try {
      const updated = await api.post<WishlistItemDto>(`/parent/wishlist/${item.id}/done`);
      setWishlists((prev) => ({
        ...prev,
        [item.childId]: (prev[item.childId] ?? []).map((w) => (w.id === item.id ? updated : w)),
      }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const removeWish = async (item: WishlistItemDto) => {
    if (!window.confirm('Удалить пункт из вишлиста?')) return;
    try {
      await api.del(`/parent/wishlist/${item.id}`);
      setWishlists((prev) => ({
        ...prev,
        [item.childId]: (prev[item.childId] ?? []).filter((w) => w.id !== item.id),
      }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  if (loading) return <Spinner label="Загружаем детей…" />;

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Дети</h1>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Добавить ребенка
        </button>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="Пока нет детей"
          hint="Добавьте ребенка, чтобы выдать ему ключ доступа"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <div key={child.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {child.avatarEmoji}
                  </div>
                  <div>
                    <div className="font-bold">{child.name}</div>
                    <div className="text-xs text-slate-500">
                      {child.age != null ? `возраст ${child.age} лет · ` : ''}создан {fmtDate(child.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void toggleActive(child)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    title={child.active ? 'Деактивировать' : 'Активировать'}
                  >
                    {child.active ? <CheckCircle2 size={18} className="text-emerald-600" /> : <CheckCircle2 size={18} className="text-slate-300" />}
                  </button>
                  <button
                    onClick={() => openEdit(child)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    title="Редактировать"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => void remove(child)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Удалить"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <KeyRound size={16} className="shrink-0 text-indigo-500" />
                <code className="flex-1 truncate font-mono text-sm font-bold tracking-wider text-slate-700">
                  {child.accessKey}
                </code>
                <button
                  onClick={() => void copyKey(child)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                  title="Скопировать ключ"
                >
                  {copiedId === child.id ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <button
                onClick={() => void regenerate(child)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw size={16} /> Перегенерировать ключ
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Gift size={16} className="text-indigo-500" />
                  Вишлист
                  <span className="ml-auto text-xs font-normal text-slate-400">
                    {wishlists[child.id]?.length ?? 0} шт.
                  </span>
                </div>
                {wishlists[child.id]?.length ? (
                  <ul className="space-y-1.5">
                    {wishlists[child.id].map((item) => (
                      <li
                        key={item.id}
                        className={`rounded-lg bg-white px-2.5 py-1.5 text-sm ${
                          item.status === 'DONE' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex-1 ${item.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                          >
                            {item.title}
                          </span>
                          {item.status === 'DONE' ? (
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                          ) : (
                            <button
                              onClick={() => void markWishDone(item)}
                              className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50"
                              title="Выполнено"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => void removeWish(item)}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Удалить"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {(item.link || item.price != null) && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 underline"
                              >
                                ссылка
                              </a>
                            )}
                            {item.price != null && <span>💰 {item.price}</span>}
                            <span className="text-amber-500">
                              {'★'.repeat(item.desire)}
                              <span className="text-slate-300">{'★'.repeat(5 - item.desire)}</span>
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Ребенок пока ничего не добавил</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Редактировать ребенка' : 'Новый ребенок'}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="label">Имя</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например, Миша"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Аватар (эмодзи)</label>
              <input
                className="input"
                value={form.avatarEmoji}
                onChange={(e) => setForm({ ...form, avatarEmoji: e.target.value })}
                placeholder="😊"
              />
            </div>
            <div>
              <label className="label">Возраст (5–16)</label>
              <input
                type="number"
                min={5}
                max={16}
                className="input"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="Например, 9"
              />
              <p className="mt-1 text-xs text-slate-400">
                От возраста зависит сложность ежедневных дейликов (задачи, карточки слов, примеры)
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Активен (может входить по ключу)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button className="btn-primary" disabled={busy} onClick={() => void save()}>
                Сохранить
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}