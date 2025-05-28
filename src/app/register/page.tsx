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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded bg-white p-6 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
          Регистрация
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
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700 focus:outline-none"
        >
          Зарегистрироваться
        </button>
        <button className="underline" onClick={() => router.push("/login")}>Do you already have an accaunt?</button>


        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}
