"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SockJS from 'sockjs-client';
import { Client, IMessage } from "@stomp/stompjs";
import ProtectedRoute from "../components/ProtectedRoute";

export default function GamePage() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str: string) => console.log(str),
    });

    client.onConnect = (frame: any) => {
      console.log("Connected: " + frame);
      setStompClient(client);
      
      client.subscribe("/topic/game", (message: IMessage) => {
        const game = JSON.parse(message.body);
        setBoard(game.board);
        setCurrentPlayer(game.currentPlayer);
        setWinner(game.winner);
        if (!gameId) setGameId(game.gameId);
      });

      // Start new game
      const username = localStorage.getItem("username");
      if (username) {
        client.publish({
          destination: "/app/game/start",
          body: JSON.stringify({ username }),
        });
      }
    };

    client.activate();
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [gameId, router]);

  const handleClick = (index: number) => {
    if (winner || board[index] || !stompClient) return;

    const newBoard = [...board];
    const username = localStorage.getItem("username");
    newBoard[index] = currentPlayer === username ? "X" : "O";
    
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        gameId,
        board: newBoard,
      }),
    });
  };

  const renderCell = (index: number) => {
    return (
      <button
        key={index}
        className="w-24 h-24 border border-gray-300 flex items-center justify-center text-4xl"
        onClick={() => handleClick(index)}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Tic Tac Toe</h1>
      
      {winner && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          Winner: {winner}
        </div>
      )}

      <div className="grid grid-cols-3 gap-0 w-72 mx-auto">
        {Array(9).fill(null).map((_, index) => renderCell(index))}
      </div>

      <div className="mt-4 text-center">
        Current Player: {currentPlayer}
      </div>
    </div>
    </ProtectedRoute>
  );
}