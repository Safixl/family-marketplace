import { useEffect, useRef } from 'react';
import { api } from '../api/client';

interface Options {
  /** Активная карточка (null — тест не идёт). */
  cardId: number | null;
  /** Статус карточки: анти-читинг работает только для IN_PROGRESS. */
  status: string | null;
  /** Ответы в порядке задач. */
  answers: string[];
  /** Префикс пути: /child/math-cards, /child/logic-cards или /child/lang-cards. */
  basePath: string;
  /** Перезагрузить карточку после возврата на страницу. */
  onResume?: () => void;
}

/**
 * Анти-читинг для карточек с таймером.
 *
 * - при вводе ответов раз в 400 мс сохраняет черновик на сервере;
 * - при сворачивании приложения/браузера (visibilitychange, pagehide, freeze)
 *   моментально завершает тест с уже введёнными ответами через fetch keepalive;
 * - при возврате повторяет завершение обычным запросом (страховка, если keepalive не дошёл)
 *   и перезагружает карточку;
 * - blur сохраняет только черновик, чтобы не завершать тест из-за клавиатуры/селектов.
 */
export function useAntiCheatTest({ cardId, status, answers, basePath, onResume }: Options) {
  const answersRef = useRef(answers);
  const onResumeRef = useRef(onResume);
  const submittedRef = useRef(false);
  const wasHiddenRef = useRef(false);
  const draftTimerRef = useRef<number | null>(null);
  const active = status === 'IN_PROGRESS' && cardId != null;
  // Содержимое ответов, а не идентичность массива: таймер карточки перерисовывает компонент каждую секунду.
  const answersKey = answers.join('\u0001');

  useEffect(() => {
    answersRef.current = answers;
  }, [answersKey]);

  useEffect(() => {
    onResumeRef.current = onResume;
  }, [onResume]);

  // Новая карточка — новый цикл завершения.
  useEffect(() => {
    submittedRef.current = false;
    wasHiddenRef.current = false;
  }, [cardId]);

  // Debounce черновика: не шлём запрос на каждое нажатие клавиши.
  useEffect(() => {
    if (!active || cardId == null) return;
    if (draftTimerRef.current != null) {
      window.clearTimeout(draftTimerRef.current);
    }
    draftTimerRef.current = window.setTimeout(() => {
      api.keepalivePut(`${basePath}/${cardId}/answers`, { answers: answersRef.current });
    }, 400);
    return () => {
      if (draftTimerRef.current != null) {
        window.clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }
    };
  }, [active, cardId, basePath, answersKey]);

  useEffect(() => {
    if (!active || cardId == null) return;

    const finish = () => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      api.keepalivePost(`${basePath}/${cardId}/submit`, { answers: answersRef.current });
    };

    const onVisibility = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        // Последний черновик + немедленное завершение теста.
        api.keepalivePut(`${basePath}/${cardId}/answers`, { answers: answersRef.current });
        finish();
        return;
      }
      if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        // Страховка: keepalive мог не дойти (потеря сети, агрессивная экономия iOS).
        void api
          .post(`${basePath}/${cardId}/submit`, { answers: answersRef.current })
          .catch(() => undefined);
        submittedRef.current = false;
        onResumeRef.current?.();
      }
    };

    const onPageHide = () => {
      wasHiddenRef.current = true;
      finish();
    };
    const onFreeze = () => {
      wasHiddenRef.current = true;
      finish();
    };
    // Safari bfcache: страница вернулась из кэша — добиваем завершение и перезагружаем карточку.
    const onPageShow = () => {
      if (!wasHiddenRef.current) return;
      wasHiddenRef.current = false;
      void api
        .post(`${basePath}/${cardId}/submit`, { answers: answersRef.current })
        .catch(() => undefined);
      submittedRef.current = false;
      onResumeRef.current?.();
    };
    // blur — только черновик: на iOS он срабатывает при показе клавиатуры.
    const onBlur = () => {
      api.keepalivePut(`${basePath}/${cardId}/answers`, { answers: answersRef.current });
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('freeze', onFreeze as EventListener);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('freeze', onFreeze as EventListener);
      window.removeEventListener('blur', onBlur);
    };
  }, [active, cardId, basePath]);
}
