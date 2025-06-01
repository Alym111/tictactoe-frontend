"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../auth';
import { useAuth } from '@/hooks/useAuth';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Sidebar from '../components/sideBar';

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
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({ webSocketFactory: () => socket });

    client.onConnect = () => {
      client.subscribe("/topic/games", (message) => {
        const games = JSON.parse(message.body);
        console.log("LOBBY WS: Received games update:", games);
        setAvailableGames(games);
        if (games.length === 0) {
          console.log("No available games!");
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="text-amber-700">Загрузка...</div>
    </div>
  );
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <Sidebar />
      
      <div className="fixed inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-light text-amber-900 text-center mb-6">
            Добро пожаловать, <span className="font-medium">{user.username}</span>!
          </h2>
          
          {error && (
            <div className="bg-amber-100 text-amber-800 p-3 rounded mb-4 text-center">
              Ошибка авторизации: {error}
            </div>
          )}
          
          {lobbyError && (
            <div className="bg-amber-100 text-amber-800 p-3 rounded mb-4 text-center">
              {lobbyError}
            </div>
          )}
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={createGame} 
              disabled={loadingGames}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {loadingGames ? 'Создание...' : 'Создать игру'}
            </button>
          </div>
          
          <h3 className="text-xl font-light text-amber-800 text-center mb-4">
            Доступные игры:
          </h3>
          
          <div className="space-y-4">
            {loadingGames ? (
              <p className="text-center text-amber-700">Загрузка игр...</p>
            ) : availableGames.length > 0 ? (
              availableGames.map(game => (
                <div 
                  key={game.gameId} 
                  className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-amber-900">Игра #{game.gameId}</h4>
                      <p className="text-sm text-amber-700">
                        Игрок: {game.player1?.username || 'Неизвестно'}
                      </p>
                    </div>
                    <button
                      onClick={() => joinGame(game.gameId)}
                      disabled={!!game.player2}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        game.player2 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {game.player2 ? 'Игра полная' : 'Присоединиться'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-amber-700">Нет доступных игр</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}