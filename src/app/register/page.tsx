"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const isSuccess = await registerUser({ username, password });
    
    if (isSuccess) {
      router.push(`/login?username=${encodeURIComponent(username)}`);
    } else {
      setError("Registration failed. Username may be taken.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm"
      >
        <h2 className="mb-8 text-center text-3xl font-light text-amber-900">
          Регистрация
        </h2>

        <div className="mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
            required
            className="w-full border-b border-amber-200 bg-transparent px-3 py-2 text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none rounded-md"
          />
        </div>

        <div className="mb-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            className="w-full border-b border-amber-200 bg-transparent px-3 py-2 text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none rounded-md" 
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-amber-600 py-3 text-white transition-colors hover:bg-amber-700 focus:outline-none"
        >
          Зарегистрироваться
        </button>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-amber-600 hover:text-amber-800 focus:outline-none"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-amber-700">{error}</p>
        )}
      </form>
    </div>
  );
}