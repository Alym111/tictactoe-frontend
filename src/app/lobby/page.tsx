"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../auth';
import { useAuth } from '@/hooks/useAuth';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function Lobby() {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  useEffect(() => {
    if (!user) return;
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({ webSocketFactory: () => socket, reconnectDelay: 5000 });
    client.onConnect = () => {
      client.subscribe("/topic/games", (message) => {
        setAvailableGames(JSON.parse(message.body));
      });
    };
    client.activate();
    stompClientRef.current = client;
    client.deactivate();
  }, [user]);

  // Первый fetch при заходе
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) {
      setLobbyError('Необходима авторизация');
      return;
    }
    setLoadingGames(true);
    fetch('http://localhost:8080/api/games', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки игр');
        return res.json();
      })
      .then(setAvailableGames)
      .catch(err => {
        setLobbyError(err.message);
        setAvailableGames([]);
      })
      .finally(() => setLoadingGames(false));
  }, [user]);

  const createGame = async () => {
    if (!user) return;
    setLoadingGames(true);
    setLobbyError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Необходима авторизация');
      const response = await fetch('http://localhost:8080/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: user.username }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Ошибка создания игры');
      const game = await response.json();
      router.push(`/game?mode=create&id=${game.gameId}`);
    } catch (err: any) {
      setLobbyError(err.message || 'Ошибка создания игры');
    } finally {
      setLoadingGames(false);
    }
  };

  const joinGame = (gameId: string) => {
    router.push(`/game?mode=join&id=${gameId}`);
  };

  if (loading) return <div>Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="lobby-container">
      <h2>Добро пожаловать, {user.username}!</h2>
      {error && <div className="error">Ошибка авторизации: {error}</div>}
      {lobbyError && <div className="error">{lobbyError}</div>}
      <button onClick={createGame} disabled={loadingGames}>
        {loadingGames ? 'Создание...' : 'Создать игру'}
      </button>
      <h3>Доступные игры:</h3>
      <div className="game-list">
        {loadingGames ? (
          <p>Загрузка игр...</p>
        ) : availableGames.length > 0 ? (
          availableGames.map(game => (
            <div key={game.gameId} className="game-item">
              <span>Игра #{game.gameId}</span>
              <span>Игрок: {game.player1?.username || 'Неизвестно'}</span>
              <button
                onClick={() => joinGame(game.gameId)}
                disabled={!!game.player2}
              >
                {game.player2 ? 'Игра полная' : 'Присоединиться'}
              </button>
            </div>
          ))
        ) : (
          <p>Нет доступных игр</p>
        )}
      </div>
    </div>
  );
}