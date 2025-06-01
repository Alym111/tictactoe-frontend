"use client";

import { usePlayersStatistics } from "@/hooks/usePlayerStatistics";
import React from "react";
import Sidebar from "../components/sideBar";
import { useAuth } from "@/hooks/useAuth";

const RatingPage = () => {
  const { players, loading, error } = usePlayersStatistics();
  const { user, loading: userLoading, error: userError } = useAuth();

  if (loading) return <p className="text-[#8B6B4A]">Загрузка...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex p-5">
      <Sidebar />
      <main className="flex-1 ml-10">
        <h1 className="text-[#3E2D1F] font-light text-[28px] mb-6">
          Рейтинг игроков по максимальной серии побед
        </h1>
        <div className="flex flex-col gap-3">
          {players.map((player, index) => {
            const isCurrentUser = player.username === user?.username;

            return (
              <div
                key={player.username}
                className={`
                  flex items-center justify-between px-6 py-4 rounded-xl
                  transition-all
                  ${isCurrentUser
                    ? "bg-[#EAE8DF] shadow-md shadow-[#8B6B4A]/20 font-semibold"
                    : "bg-white shadow-sm font-normal"}
                  text-[#3E2D1F]
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="text-[#8B6B4A] font-bold text-[20px] w-8 text-center">
                    #{index + 1}
                  </div>
                  <div className="text-[18px]">{player.username}</div>
                </div>
                <div className="flex gap-8 text-[16px] text-[#8B6B4A]">
                  <div>Игр: {player.totalGames}</div>
                  <div>Побед: {player.wins}</div>
                  <div>Поражений: {player.losses}</div>
                  <div>Макс. серия: {player.maxWinStreak ?? 0}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default RatingPage;
