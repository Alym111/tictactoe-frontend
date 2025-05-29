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
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="error">Ошибка авторизации: {error}</div>;
  }

  if (!user || !mode || !id) {
    return null;
  }

  return (
    <div className="game-page">
      <h1>{mode === 'create' ? 'Ваша игра' : `Игра #${id}`}</h1>
      <TicTacToeGame
        mode={mode}
        gameId={id}
        username={user.username}
      />
    </div>
  );
}