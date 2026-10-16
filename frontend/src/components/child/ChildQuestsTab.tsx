import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ScrollText, Send, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { QuestDto, QuestSubmissionDto } from '../../api/types';
import { errMsg, fmtDate } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

/**
 * Экран «Квесты»: пул активных квестов от ГМа (родителя).
 * Ребёнок нажимает «Выполнено», при желании добавляет комментарий и ссылку на фото.
 * Награда: валюта магазина + общий опыт (за сезонные квесты — жетоны ивента).
 */
export default function ChildQuestsTab() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [submissions, setSubmissions] = useState<QuestSubmissionDto[]>([]);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [openQuestId, setOpenQuestId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setQuests(await api.get<QuestDto[]>('/child/quests'));
      setSubmissions(await api.get<QuestSubmissionDto[]>('/child/quest-submissions'));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (questId: number) => {
    setBusy(true);
    try {
      await api.post(`/child/quests/${questId}/submit`, {
        comment: comment.trim() || null,
        photoUrl: photoUrl.trim() || null,
      });
      setComment('');
      setPhotoUrl('');
      setOpenQuestId(null);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!quests && !submissions) return <Spinner label="Загружаем квесты…" />;

  const pending = submissions.filter((s) => s.status === 'PENDING');

  return (
    <div className="space-y-6">
      <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
        <h2 className="rpg-title flex items-center gap-2 text-xl">
          <ScrollText size={22} className="text-amber-400" /> Квесты ГМа
        </h2>
        <p className="mt-1 text-sm text-stone-400">
          Сюжетные задания от родителя. Выполнил — нажми «Выполнено» и жди подтверждения. Награда
          начисляется после одобрения.
        </p>
        {pending.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            <Clock3 size={16} /> Ожидает подтверждения: {pending.length}
          </div>
        )}
      </section>

      {quests.length === 0 ? (
        <EmptyState
          title="Квестов пока нет"
          hint="Когда родитель создаст дейлики или сюжетные квесты, они появятся здесь"
          icon={<ScrollText size={40} />}
        />
      ) : (
        <div className="space-y-3">
          {quests.map((quest) => (
            <div key={quest.id} className="rpg-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
                    {quest.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-100">
                      {quest.title}
                      {quest.type === 'DAILY' && <span className="ml-2 text-xs text-emerald-300">· дейлик</span>}
                      {quest.type === 'SEASONAL' && <span className="ml-2 text-xs text-fuchsia-300">· сезонный</span>}
                    </div>
                    {quest.description && <div className="mt-0.5 text-sm text-stone-400">{quest.description}</div>}
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {quest.rewardAmount > 0 && quest.currencyIcon && (
                        <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
                          {quest.currencyIcon} +{quest.rewardAmount} {quest.currencyName}
                        </span>
                      )}
                      {quest.xpReward > 0 && (
                        <span className="rpg-badge border border-sky-500/30 bg-sky-500/15 text-sky-300">
                          +{quest.xpReward} XP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="rpg-btn"
                  disabled={busy}
                  onClick={() => setOpenQuestId(openQuestId === quest.id ? null : quest.id)}
                >
                  <Send size={15} /> Выполнено
                </button>
              </div>

              {openQuestId === quest.id && (
                <div className="mt-3 space-y-2 rounded-xl bg-stone-900/60 p-3">
                  <textarea
                    className="rpg-input min-h-[70px] w-full"
                    placeholder="Комментарий для родителя (что сделано)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <input
                    className="rpg-input w-full"
                    placeholder="Ссылка на фото (необязательно)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button className="rpg-btn rpg-btn-ghost" onClick={() => setOpenQuestId(null)}>
                      Отмена
                    </button>
                    <button className="rpg-btn" disabled={busy} onClick={() => void submit(quest.id)}>
                      Отправить на проверку
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* История заявок */}
      {submissions.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">Мои заявки</h3>
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="rpg-panel flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="text-lg">{s.questIcon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-amber-100">{s.questTitle}</div>
                  <div className="text-xs text-stone-400">{fmtDate(s.createdAt)}</div>
                  {s.comment && <div className="mt-0.5 text-xs text-stone-400">{s.comment}</div>}
                </div>
                {s.status === 'PENDING' && (
                  <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
                    <Clock3 size={11} /> Ожидает
                  </span>
                )}
                {s.status === 'APPROVED' && (
                  <span className="rpg-badge border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                    <CheckCircle2 size={11} /> Одобрено
                  </span>
                )}
                {s.status === 'REJECTED' && (
                  <span className="rpg-badge border border-rose-500/30 bg-rose-500/15 text-rose-300">
                    <XCircle size={11} /> На доработку
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
