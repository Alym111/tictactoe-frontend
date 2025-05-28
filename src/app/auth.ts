// auth.ts
type Credentials = {
  username: string;
  password: string;
};

export async function registerUser({ username, password }: Credentials): Promise<boolean> {
  const res = await fetch('http://localhost:8080/api/players/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!res.ok) return false;
  return await res.json();
}





// src/app/auth.ts
export async function loginUser(credentials: { username: string; password: string }) {
  try {
    const response = await fetch('/api/players/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Ошибка авторизации');
    }

    // Вариант 1: Если сервер возвращает чистый токен
    const token = await response.text();
    localStorage.setItem('jwt', token);
    return token;

    // Вариант 2: Если сервер возвращает JSON (рекомендуется)
    // const { token } = await response.json();
    // localStorage.setItem('jwt', token);
    // return token;

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}


export function getToken() {
  return localStorage.getItem('jwt'); // Получаем токен
}

export function logout() {
  localStorage.removeItem('jwt'); // Удаляем токен
}
