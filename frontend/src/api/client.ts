const SESSION_KEY = 'fm_session';

export type Session =
  | { type: 'parent'; token: string; profile: { id: number; name: string; email: string } }
  | { type: 'child'; accessKey: string; profile: { id: number; name: string; avatarEmoji: string } };

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function persistSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(options: RequestInit = {}): Record<string, string> {
  const session = loadSession();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (session?.type === 'parent') {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  if (session?.type === 'child') {
    headers['X-Access-Key'] = session.accessKey;
  }
  return headers;
}

/**
 * Fire-and-forget запрос, который переживает сворачивание/закрытие страницы.
 * Нужен для анти-читинга: завершение теста и сохранение черновика при pagehide/visibilitychange.
 */
function keepaliveRequest(path: string, method: 'POST' | 'PUT', body?: unknown): void {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  try {
    void fetch(`/api${path}`, {
      method,
      headers: authHeaders({ body: payload }),
      body: payload,
      keepalive: true,
    });
  } catch {
    // страница уже закрывается — ответ не нужен
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = authHeaders(options);
  const response = await fetch(`/api${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // тело ответа не JSON
    }
    if (response.status === 401) {
      clearSession();
      window.dispatchEvent(new Event('fm:unauthorized'));
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  // Void-эндпоинты (identify/equip/accept/delete и т.п.) отвечают 200 с пустым телом —
  // response.json() на нём бросает SyntaxError, из-за чего вызывающий код уходит в catch.
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

/** Скачивание файла с авторизацией (возвращает Blob). */
export async function downloadFile(path: string): Promise<Blob> {
  const session = loadSession();
  const headers: Record<string, string> = {};
  if (session?.type === 'parent') {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  if (session?.type === 'child') {
    headers['X-Access-Key'] = session.accessKey;
  }
  const response = await fetch(`/api${path}`, { headers });
  if (!response.ok) {
    throw new ApiError(`Ошибка скачивания (${response.status})`, response.status);
  }
  return response.blob();
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: (path: string): Promise<void> => request<void>(path, { method: 'DELETE' }),
  /** Запрос, который должен успеть уйти при сворачивании/закрытии страницы. */
  keepalivePost: (path: string, body?: unknown): void => keepaliveRequest(path, 'POST', body),
  keepalivePut: (path: string, body?: unknown): void => keepaliveRequest(path, 'PUT', body),
};