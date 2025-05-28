// src/auth.ts
type Credentials = {
  username: string;
  password: string;
};

export async function registerUser({ username, password }: Credentials): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8080/api/players/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loginUser(credentials: Credentials) {
  try {
    const response = await fetch('http://localhost:8080/api/players/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Ошибка авторизации');
    }

    const token = await response.text();
    console.log('Saving token:', token); // Для отладки
    localStorage.setItem('jwt', token);
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export function getToken() {
  const token = localStorage.getItem('jwt');
  console.log('Retrieved token:', token); // Для отладки
  return token;
}

export function logout() {
  localStorage.removeItem('jwt');
}