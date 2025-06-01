"use client";
import { useState, useEffect, useCallback } from "react";
import { Client, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "../auth";
import { useRouter } from "next/navigation";

interface TicTacToeGameProps {
  mode: string;
  gameId?: string;
  username: string;
}

export default function TicTacToeGame({
  mode,
  gameId,
  username,
}: TicTacToeGameProps) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [gameStatus, setGameStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<"X" | "O">("X");
  const [opponent, setOpponent] = useState<string | null>(null);
  const [waitingOpponent, setWaitingOpponent] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [showRematchModal, setShowRematchModal] = useState(false);
  const [rematchFrom, setRematchFrom] = useState<string | null>(null);
  const [rematchState, setRematchState] = useState<{
    player1WantsRematch?: boolean;
    player2WantsRematch?: boolean;
    status?: string;
  }>({});

  const router = useRouter();

  const handleLeaveGame = () => {
    if (!stompClient || !gameId) return;
    stompClient.publish({
      destination: `/app/game/leave/${gameId}`,
      body: JSON.stringify({ username }),
    });
    setTimeout(() => router.push("/lobby"), 2000);
  };

  const updateGameState = useCallback((game: any) => {
    setBoard(game.board || Array(9).fill(null));
    setIsYourTurn(game.currentPlayer === username);
    setGameStatus(
      game.winner
        ? `Победитель: ${game.winner}`
        : game.status === "FINISHED"
        ? "Ничья!"
        : ""
    );
    
    if ((game.status === "WAITING" || !game.player2) && 
        (game.player1?.username === username || game.player2?.username === username)) {
      setWaitingOpponent(true);
    } else {
      setWaitingOpponent(false);
    }

    setRematchState({
      player1WantsRematch: game.player1WantsRematch,
      player2WantsRematch: game.player2WantsRematch,
      status: game.status,
    });

    if (game.player1 && game.player2) {
      if (game.player1.username === username) {
        setSymbol("X");
        setOpponent(game.player2.username);
      } else {
        setSymbol("O");
        setOpponent(game.player1.username);
      }
    }

    if (!game || !game.player1) {
      if (username !== (game?.player1?.username)) {
        setTimeout(() => router.push("/lobby"), 1000);
      }
      return;
    }

    if (game.status === "FINISHED" &&
        ((game.player1WantsRematch && username === game.player2?.username && !rematchRequested) ||
         (game.player2WantsRematch && username === game.player1?.username && !rematchRequested))) {
      setShowRematchModal(true);
      setRematchFrom(
        game.player1WantsRematch ? game.player1?.username : game.player2?.username
      );
    } else {
      setShowRematchModal(false);
      setRematchFrom(null);
    }

    if (game.status === "REJECTED") {
      setRematchRequested(false);
      setShowRematchModal(false);
      setRematchFrom(null);
      setTimeout(() => router.push("/lobby"), 1000);
    }

    if ((game.status === "IN_PROGRESS" || game.status === "WAITING") && rematchRequested) {
      setRematchRequested(false);
      setShowRematchModal(false);
      setRematchFrom(null);
    }
  }, [username, rematchRequested, router]);

  useEffect(() => {
    if (!gameId) {
      setError("Идентификатор игры отсутствует");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Необходима авторизация");
      return;
    }

    const client = Stomp.over(() => new SockJS("http://localhost:8080/ws"));

    client.onConnect = () => {
      setStompClient(client);

      client.subscribe(`/topic/game/${gameId}`, (message) => {
        try {
          const game = JSON.parse(message.body);
          updateGameState(game);
        } catch (err) {
          setError("Ошибка обработки обновления игры");
        }
      });

      try {
        const payload = JSON.stringify({ username });
        if (mode === "create") {
          client.publish({
            destination: "/app/game/start",
            body: payload,
          });
        } else if (mode === "join") {
          client.publish({
            destination: `/app/game/join/${gameId}`,
            body: payload,
          });
        }
      } catch (err) {
        setError("Ошибка отправки действия");
      }
    };

    client.onStompError = (frame) => {
      setError("Ошибка подключения к серверу: " + frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
      setStompClient(null);
    };
  }, [gameId, mode, username, updateGameState]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (!isYourTurn || board[index] || !stompClient || gameStatus) return;

      const newBoard = [...board];
      newBoard[index] = symbol;

      try {
        stompClient.publish({
          destination: "/app/game/move",
          body: JSON.stringify({
            gameId,
            board: newBoard,
            currentPlayer: username,
          }),
        });
      } catch (err) {
        setError("Ошибка отправки хода");
      }
    },
    [isYourTurn, board, stompClient, gameStatus, gameId, username, symbol]
  );

  const handleRematch = useCallback(() => {
    if (!stompClient || !gameId) return;
    stompClient.publish({
      destination: `/app/game/rematch/${gameId}`,
      body: JSON.stringify({ username, agree: true }),
    });
    setRematchRequested(true);
  }, [stompClient, gameId, username]);

  const handleRematchResponse = (agree: boolean) => {
    if (!stompClient || !gameId) return;
    stompClient.publish({
      destination: `/app/game/rematch/${gameId}`,
      body: JSON.stringify({ username, agree }),
    });
    setShowRematchModal(false);
    setRematchRequested(agree);
    if (!agree) {
      router.push("/lobby");
    }
  };

  const renderBoard = () => (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-2 mb-6">
        {Array(9).fill(null).map((_, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!isYourTurn || !!board[index] || !!gameStatus}
            className={`w-20 h-20 flex items-center justify-center text-3xl font-medium rounded-md transition-colors
              ${!board[index] && isYourTurn && !gameStatus ? 
                'bg-amber-100 hover:bg-amber-200 cursor-pointer' : 
                'bg-amber-50 cursor-not-allowed'}
              ${board[index] === 'X' ? 'text-amber-700' : 'text-amber-900'}`}
          >
            {board[index]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded text-center">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium text-amber-800">
          {gameStatus || `Ходит: ${isYourTurn ? "Вы" : opponent || "Противник"}`}
        </div>
        <button 
          onClick={handleLeaveGame}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Выйти
        </button>
      </div>

      {waitingOpponent ? (
        <div className="text-center py-8">
          <p className="text-amber-700 mb-4">Ожидание соперника...</p>
          <div className="animate-pulse">
            <div className="h-2 bg-amber-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-2 bg-amber-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      ) : (
        renderBoard()
      )}

      {gameStatus && opponent && (
        <div className="text-center">
          <button 
            onClick={handleRematch} 
            disabled={rematchRequested}
            className={`px-6 py-2 rounded-md transition-colors
              ${rematchRequested ? 
                'bg-amber-300 text-amber-700 cursor-not-allowed' : 
                'bg-amber-600 text-white hover:bg-amber-700'}`}
          >
            {rematchRequested ? "Ожидание ответа..." : "Играть снова"}
          </button>
        </div>
      )}

      {showRematchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-amber-900 mb-4">
              {rematchFrom} хочет сыграть ещё раз
            </h3>
            <p className="text-amber-700 mb-6">Согласны?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleRematchResponse(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                Да
              </button>
              <button 
                onClick={() => handleRematchResponse(false)}
                className="px-4 py-2 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50 transition-colors"
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}