"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TicTacToeGame from '../components/tictactoegame';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const id = searchParams.get('id');
  const { user, loading, error } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || !mode || !id) {
        console.log('Redirecting to /login due to:', { user, mode, id });
        router.push('/login');
      }
    }
  }, [user, mode, id, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-amber-700">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="bg-amber-100 text-amber-800 p-4 rounded-lg max-w-md mx-auto">
          Ошибка авторизации: {error}
        </div>
      </div>
    );
  }

  if (!user || !mode || !id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-light text-amber-900 mb-6 text-center">
          {mode === 'create' ? 'Ваша игра' : `Игра #${id}`}
        </h1>
        <TicTacToeGame
          mode={mode}
          gameId={id}
          username={user.username}
        />
      </div>
    </div>
  );
}