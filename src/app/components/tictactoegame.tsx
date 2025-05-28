"use client";
import { useState, useEffect, useCallback } from 'react';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '../auth';

interface TicTacToeGameProps {
  mode: string;
  gameId?: string;
  username: string;
}

export default function TicTacToeGame({ mode, gameId, username }: TicTacToeGameProps) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [gameStatus, setGameStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateGameState = useCallback((game: any) => {
    setBoard(game.board || Array(9).fill(null));
    setIsYourTurn(game.currentPlayer === username);
    setGameStatus(
      game.winner ? `Победитель: ${game.winner}` :
      game.status === 'FINISHED' ? 'Ничья!' : ''
    );
  }, [username]);

  useEffect(() => {
    if (!gameId) {
      setError('Идентификатор игры отсутствует');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Необходима авторизация');
      return;
    }

    const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));

    client.onConnect = () => {
      setStompClient(client);

      client.subscribe(`/topic/game/${gameId}`, (message) => {
        try {
          const game = JSON.parse(message.body);
          updateGameState(game);
        } catch (err) {
          setError('Ошибка обработки обновления игры');
        }
      });

      try {
        const payload = JSON.stringify({ username });
        if (mode === 'create') {
          client.publish({
            destination: '/app/game/start',
            body: payload,
          });
        } else if (mode === 'join') {
          client.publish({
            destination: `/app/game/join/${gameId}`,
            body: payload,
          });
        }
      } catch (err) {
        setError('Ошибка отправки действия');
      }
    };

    client.onStompError = (frame) => {
      setError('Ошибка подключения к серверу: ' + frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
      setStompClient(null);
    };
  }, [gameId, mode, username, updateGameState]);

  const handleCellClick = useCallback((index: number) => {
    if (!isYourTurn || board[index] || !stompClient || gameStatus) return;

    const newBoard = [...board];
    newBoard[index] = isYourTurn ? 'X' : 'O';

    try {
      stompClient.publish({
        destination: '/app/game/move',
        body: JSON.stringify({
          gameId,
          board: newBoard,
          currentPlayer: username,
        }),
      });
    } catch (err) {
      setError('Ошибка отправки хода');
    }
  }, [isYourTurn, board, stompClient, gameStatus, gameId, username]);

  const handleRestart = useCallback(() => {
    if (!stompClient || !gameId) return;

    try {
      stompClient.publish({
        destination: `/app/game/restart/${gameId}`,
      });
    } catch (err) {
      setError('Ошибка перезапуска игры');
    }
  }, [stompClient, gameId]);

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <div className="game-container">
      <div className="game-status">{gameStatus || `Ходит: ${isYourTurn ? 'Вы' : 'Противник'}`}</div>
      <div className="game-board">
        {board.map((cell, i) => (
          <button
            key={i}
            className="cell"
            onClick={() => handleCellClick(i)}
            disabled={!isYourTurn || !!cell || !!gameStatus}
          >
            {cell}
          </button>
        ))}
      </div>
      {gameStatus && (
        <button onClick={handleRestart}>
          Играть снова
        </button>
      )}
    </div>
  );
}