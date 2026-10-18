import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock3, ScrollText, Send, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { QuestDto, QuestSubmissionDto } from '../../api/types';
import { errMsg, fmtDate } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

/**
 * Экран «Квесты ГМа» со стадиями:
 *  - (!) AVAILABLE — доступен для принятия, базовое описание;
 *  - (?) ACTIVE — взят, описание выполнения и таймер (если задан);
 *  - SUBMITTED — на проверке;
 *  - SLEEPING — повторяемый, ожидание повторного взятия (таймер в карточке);
 *  - DONE — одноразовый выполнен (скрыт).
 */
export default function ChildQuestsTab() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [submissions, setSubmissions] = useState<QuestSubmissionDto[]>([]);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [openQuestId, setOpenQuestId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const timerRef = useRef<number | null>(null);

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

  // Тикер для обратных отсчётов (таймеры выполнения и спячки)
  useEffect(() => {
    timerRef.current = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, []);

  const accept = async (questId: number) => {
    setBusy(true);
    try {
      await api.post(`/child/quests/${questId}/accept`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

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
          Сюжетные задания от родителя. Взять квест (!), выполнить (?) и отправить на проверку. Награда
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
            <QuestCard
              key={quest.id}
              quest={quest}
              busy={busy}
              open={openQuestId === quest.id}
              comment={comment}
              photoUrl={photoUrl}
              onToggle={() => setOpenQuestId(openQuestId === quest.id ? null : quest.id)}
              onCommentChange={setComment}
              onPhotoChange={setPhotoUrl}
              onAccept={() => void accept(quest.id)}
              onSubmit={() => void submit(quest.id)}
            />
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

// ---------- Карточка квеста со стадией ----------

function fmtCountdown(target: string | null): string | null {
  if (!target) return null;
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин ${sec} с`;
  return `${sec} с`;
}

interface CardProps {
  quest: QuestDto;
  busy: boolean;
  open: boolean;
  comment: string;
  photoUrl: string;
  onToggle: () => void;
  onCommentChange: (v: string) => void;
  onPhotoChange: (v: string) => void;
  onAccept: () => void;
  onSubmit: () => void;
}

function QuestCard({
  quest,
  busy,
  open,
  comment,
  photoUrl,
  onToggle,
  onCommentChange,
  onPhotoChange,
  onAccept,
  onSubmit,
}: CardProps) {
  const status = quest.childStatus ?? 'AVAILABLE';
  const isAvailable = status === 'AVAILABLE';
  const isActive = status === 'ACTIVE';
  const isSubmitted = status === 'SUBMITTED';
  const isSleeping = status === 'SLEEPING';

  // Таймер выполнения (?) — от момента взятия
  const deadline =
    isActive && quest.durationMinutes && quest.childStartsAt
      ? new Date(new Date(quest.childStartsAt).getTime() + quest.durationMinutes * 60_000).toISOString()
      : null;
  const countdown = isSleeping ? fmtCountdown(quest.childNextAvailableAt) : fmtCountdown(deadline);

  return (
    <div className="rpg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
            {quest.icon}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 font-bold text-amber-100">
              {quest.title}
              {quest.type === 'DAILY' && <span className="text-xs text-emerald-300">· дейлик</span>}
              {quest.type === 'SEASONAL' && <span className="text-xs text-fuchsia-300">· сезонный</span>}
              {isAvailable && (
                <span className="rpg-badge border border-sky-500/40 bg-sky-500/15 text-sky-300">! доступен</span>
              )}
              {isActive && (
                <span className="rpg-badge border border-amber-500/40 bg-amber-500/15 text-amber-300">
                  ? в работе
                </span>
              )}
              {isSubmitted && (
                <span className="rpg-badge border border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300">
                  на проверке
                </span>
              )}
              {isSleeping && (
                <span className="rpg-badge border border-stone-500/40 bg-stone-500/15 text-stone-300">
                  💤 перерыв
                </span>
              )}
            </div>
            <div className="mt-0.5 text-sm text-stone-400">
              {isAvailable
                ? (quest.basicDescription ?? quest.description)
                : (quest.acceptDescription ?? quest.description)}
            </div>
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
              {quest.durationMinutes != null && quest.durationMinutes > 0 && (
                <span className="rpg-badge border border-violet-500/30 bg-violet-500/15 text-violet-300">
                  ⏱ {quest.durationMinutes} мин
                </span>
              )}
              {quest.repeatable && quest.cooldownHours > 0 && (
                <span className="rpg-badge border border-stone-500/30 bg-stone-500/15 text-stone-300">
                  перерыв {quest.cooldownHours} ч
                </span>
              )}
            </div>
            {countdown && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Clock3 size={12} />
                {isSleeping ? `до повторного взятия: ${countdown}` : `осталось: ${countdown}`}
              </div>
            )}
          </div>
        </div>

        {isAvailable && (
          <button className="rpg-btn" disabled={busy} onClick={onAccept}>
            <Send size={15} /> Взять квест
          </button>
        )}
        {isActive && (
          <button
            className="rpg-btn"
            disabled={busy}
            onClick={() => (open ? onToggle() : onToggle())}
          >
            <Send size={15} /> Выполнено
          </button>
        )}
        {isSubmitted && (
          <span className="rpg-badge border border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300">
            <Clock3 size={11} /> Ждёт проверки
          </span>
        )}
        {isSleeping && (
          <span className="rpg-badge border border-stone-500/40 bg-stone-500/15 text-stone-300">
            💤 {countdown ?? 'скоро'}
          </span>
        )}
      </div>

      {isActive && open && (
        <div className="mt-3 space-y-2 rounded-xl bg-stone-900/60 p-3">
          <textarea
            className="rpg-input min-h-[70px] w-full"
            placeholder="Комментарий для родителя (что сделано)"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />
          <input
            className="rpg-input w-full"
            placeholder="Ссылка на фото (необязательно)"
            value={photoUrl}
            onChange={(e) => onPhotoChange(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="rpg-btn rpg-btn-ghost" onClick={onToggle}>
              Отмена
            </button>
            <button className="rpg-btn" disabled={busy} onClick={onSubmit}>
              Отправить на проверку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
