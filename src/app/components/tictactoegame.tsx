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

  // Rematch logic
  const [rematchRequested, setRematchRequested] = useState(false);
  const [showRematchModal, setShowRematchModal] = useState(false);
  const [rematchFrom, setRematchFrom] = useState<string | null>(null);

  const router = useRouter();

  // Track rematch state from server
  const [rematchState, setRematchState] = useState<{
    player1WantsRematch?: boolean;
    player2WantsRematch?: boolean;
    status?: string;
  }>({});

  const updateGameState = useCallback(
    (game: any) => {
      setBoard(game.board || Array(9).fill(null));
      setIsYourTurn(game.currentPlayer === username);

      setGameStatus(
        game.winner
          ? `Победитель: ${game.winner}`
          : game.status === "FINISHED"
          ? "Ничья!"
          : ""
      );

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

      // Показываем модалку, если другой игрок инициировал рематч
      if (
        game.status === "FINISHED" &&
        ((game.player1WantsRematch &&
          username === game.player2?.username &&
          !rematchRequested) ||
          (game.player2WantsRematch &&
            username === game.player1?.username &&
            !rematchRequested))
      ) {
        setShowRematchModal(true);
        setRematchFrom(
          game.player1WantsRematch
            ? game.player1?.username
            : game.player2?.username
        );
      } else {
        setShowRematchModal(false);
        setRematchFrom(null);
      }

      // Если оба согласились, сбрасываем состояние рематча
      if (
        game.player1WantsRematch &&
        game.player2WantsRematch &&
        (game.status === "IN_PROGRESS" || game.status === "WAITING")
      ) {
        setRematchRequested(false);
        setShowRematchModal(false);
        setRematchFrom(null);
      }

      // Если кто-то отказался
      if (game.status === "REJECTED") {
        setRematchRequested(false);
        setShowRematchModal(false);
        setRematchFrom(null);
        // Через секунду выходим в лобби
        setTimeout(() => router.push("/lobby"), 1000);
      }
    },
    [username, rematchRequested, router]
  );

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

  // Отправить запрос на рематч
  const handleRematch = useCallback(() => {
    if (!stompClient || !gameId) return;
    stompClient.publish({
      destination: `/app/game/rematch/${gameId}`,
      body: JSON.stringify({ username, agree: true }),
    });
    setRematchRequested(true);
  }, [stompClient, gameId, username]);

  // Ответить на рематч
  const handleRematchResponse = (agree: boolean) => {
    if (!stompClient || !gameId) return;
    stompClient.publish({
      destination: `/app/game/rematch/${gameId}`,
      body: JSON.stringify({ username, agree }),
    });
    setShowRematchModal(false);
    setRematchRequested(agree); // если отказался, не ждём дальше
    if (!agree) {
      router.push("/lobby");
    }
  };

  // Функция для рендера поля 3x3 без css grid/flex
  const renderBoard = () => (
    <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
      <tbody>
        {[0, 1, 2].map((row) => (
          <tr key={row}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return (
                <td
                  key={col}
                  style={{
                    border: "1px solid black",
                    width: 50,
                    height: 50,
                    textAlign: "center",
                    fontSize: 24,
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: 24,
                      background: "none",
                      border: "none",
                      cursor:
                        !isYourTurn || board[idx] || !!gameStatus
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => handleCellClick(idx)}
                    disabled={!isYourTurn || !!board[idx] || !!gameStatus}
                  >
                    {board[idx]}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="game-container">
      <div className="game-status">
        {gameStatus ||
          `Ходит: ${isYourTurn ? "Вы" : opponent || "Противник"}`}
      </div>
      {!opponent && gameStatus ? (
        <div>Ожидание второго игрока...</div>
      ) : (
        renderBoard()
      )}

      {gameStatus && opponent && (
        <button onClick={handleRematch} disabled={rematchRequested}>
          {rematchRequested ? "Ожидание ответа..." : "Играть снова"}
        </button>
      )}

      {showRematchModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              minWidth: 260,
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              {rematchFrom} хочет сыграть ещё раз. Согласны?
            </div>
            <button
              onClick={() => handleRematchResponse(true)}
              style={{ marginRight: 12 }}
            >
              Да
            </button>
            <button onClick={() => handleRematchResponse(false)}>Нет</button>
          </div>
        </div>
      )}
    </div>
  );
}