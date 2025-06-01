"use client";

import React from "react";
import Sidebar from "../components/sideBar";
import usePlayerStatistics from "@/hooks/usePlayerStatistics";
import { useAuth } from "@/hooks/useAuth";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4CAF50", "#F44336", "#FFC107"]; // зелёный, красный, янтарный

const StatisticsPage = () => {
  const { user, loading: userLoading, error: userError } = useAuth();
  const { stats, loading, error } = usePlayerStatistics(user?.username || "");

  if (loading || userLoading)
    return <div className="p-8 text-[#8B6B4A] text-lg">Загрузка...</div>;

  if (error || userError)
    return <div className="p-8 text-red-600 text-lg">{error || userError}</div>;

  const data = stats
    ? [
        { name: "Победы", value: stats.wins },
        { name: "Поражения", value: stats.losses },
        { name: "Ничьи", value: stats.draws },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-[#F5F5F4] text-[#1C1C1E]">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-semibold mb-10 border-b border-gray-200 pb-4">
          Статистика игрока <span className="font-bold text-[#3E2D1F]">{user?.username}</span>
        </h1>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Card with stats */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-medium mb-6">Общая статистика</h2>
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
                <StatItem label="Всего игр" value={stats.totalGames} />
                <StatItem label="Победы" value={stats.wins} />
                <StatItem label="Поражения" value={stats.losses} />
                <StatItem label="Ничьи" value={stats.draws} />
                <StatItem label="Текущая серия" value={stats.currentWinStreak ?? 0} />
                <StatItem label="Макс. серия" value={stats.maxWinStreak ?? 0} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-medium mb-6">Распределение побед</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 14 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col">
    <span className="text-gray-500">{label}</span>
    <span className="text-base font-medium text-[#3E2D1F]">{value}</span>
  </div>
);

export default StatisticsPage;
