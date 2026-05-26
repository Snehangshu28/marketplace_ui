import type { User } from 'firebase/auth';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

const fromEnv = import.meta.env.VITE_API_URL as string | undefined;

/** e.g. http://localhost:5001/api (must match backend PORT) */
export const API_BASE_URL = stripTrailingSlash(
  fromEnv ?? 'http://localhost:5001/api',
);

const socketFromEnv = import.meta.env.VITE_SOCKET_URL as string | undefined;

/** Same host as the API (no /api path), e.g. http://localhost:5001 */
export function serverOrigin(): string {
  return socketFromEnv
    ? stripTrailingSlash(socketFromEnv)
    : new URL(API_BASE_URL).origin;
}

/** Socket server origin, e.g. http://localhost:5001 */
export const SOCKET_URL = serverOrigin();

/** Build a full API URL. Pass paths like `/users/me` or `users/me`. */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

/**
 * Authenticated fetch: sends Firebase ID token; on 401 retries once with a forced refresh
 * (fixes races where the first token is stale right after login).
 */
export async function fetchWithIdToken(
  path: string,
  currentUser: User,
  init: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith('http') ? path : apiUrl(path);
  const run = async (forceRefresh: boolean) => {
    const token = await currentUser.getIdToken(forceRefresh);
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };
  let res = await run(false);
  if (res.status === 401) {
    res = await run(true);
  }
  return res;
}

/** Meta (Facebook) OAuth start — not under /api */
export function metaOAuthUrl(): string {
  return `${serverOrigin()}/auth/meta`;
}
