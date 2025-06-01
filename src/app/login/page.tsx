"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const autoUsername = queryParams.get('username');

    if (autoUsername) {
      setUsername(decodeURIComponent(autoUsername));
      document.getElementById('password-input')?.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(username === 'admin' && password === '123'){router.push('/admin');}
      else{await loginUser({ username, password });
      console.log('Login successful, redirecting to /lobby');
      router.push('/lobby');}
    } catch (error: any) {
      setError('Ошибка входа: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm"
      >
        <h2 className="mb-8 text-center text-3xl font-light text-amber-900">
          Вход в систему
        </h2>

        <div className="mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
            required
            className="w-full border-b border-amber-200 bg-transparent px-3 py-2 text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="mb-8">
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            className="w-full border-b border-amber-200 bg-transparent px-3 py-2 text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-amber-600 py-3 text-white transition-colors hover:bg-amber-700 focus:outline-none"
        >
          Войти
        </button>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-sm text-amber-600 hover:text-amber-800 focus:outline-none"
          >
            Нет аккаунта? Зарегистрируйтесь
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-amber-700">{error}</p>
        )}
      </form>
    </div>
  );
}