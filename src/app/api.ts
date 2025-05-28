// src/app/api.ts
import { getToken } from './auth';

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  }
  return res;
}
