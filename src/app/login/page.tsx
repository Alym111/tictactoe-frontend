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
      await loginUser({ username, password });
      console.log('Login successful, redirecting to /lobby');
      router.push('/lobby'); // Перенаправляем на лобби
    } catch (error: any) {
      setError('Ошибка входа: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-white p-6 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
          Вход в систему
        </h2>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Имя пользователя"
          required
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />

        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none"
        >
          Войти
        </button>
        <button
          className="underline mt-4 block w-full text-center"
          onClick={() => router.push("/register")}
        >
          Нет аккаунта? Зарегистрируйтесь
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}