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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: (path: string): Promise<void> => request<void>(path, { method: 'DELETE' }),
};