"use client";

import { usePlayersStatistics } from "@/hooks/usePlayerStatistics";
import React from "react";
import Sidebar from "../components/sideBar";
import { useAuth } from "@/hooks/useAuth";

const RatingPage = () => {
  const { players, loading, error } = usePlayersStatistics();
    const { user, loading : userLoading, error: userError } = useAuth();

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

    function clsx(arg0: { "bg-gray-100": boolean; }): string | undefined {
        throw new Error("Function not implemented.");
    }

  return (
    <div style={{ padding: 20 }}>
      <Sidebar />
      <h1>Рейтинг игроков по максимальной серии побед</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Имя</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Всего игр</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Побед</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Поражений</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Макс серия побед</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.username} className={`${player.username === user?.username ? "bg-gray-100" : ""}`}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.username}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.totalGames}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.wins}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.losses}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.maxWinStreak ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RatingPage;
