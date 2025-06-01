"use client";
import React from "react";
import Sidebar from "../components/sideBar";
import usePlayerStatistics from "@/hooks/usePlayerStatistics";
import { useAuth } from '@/hooks/useAuth';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

const StatisticsPage = () => {
  const { user, loading : userLoading, error: userError } = useAuth();
  const { stats, loading, error } = usePlayerStatistics(user?.username || '');

  if (loading || userLoading) return <p>Загрузка...</p>;
  if (error || userError) return <p style={{ color: "red" }}>{error || userError}</p>;

  // Формируем данные для pie chart
  const data = stats ? [
    { name: 'Побед', value: stats.wins },
    { name: 'Поражений', value: stats.losses },
    { name: 'Ничьих', value: stats.draws },
  ] : [];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: 20, flex: 1 }}>
        <h1>Статистика игрока: {user?.username}</h1>
        {stats && (
  <>
    <ul>
      <li>Всего игр: {stats.totalGames}</li>
      <li>Побед: {stats.wins}</li>
      <li>Поражений: {stats.losses}</li>
      <li>Ничьих: {stats.draws}</li>
      <li>Текущая серия побед: {stats.currentWinStreak ?? 0}</li>
      <li>Максимальная серия побед: {stats.maxWinStreak ?? 0}</li>
    </ul>

    {/* Ваш PieChart */}
    <PieChart width={400} height={300}>
      <Pie
        data={[
          { name: 'Побед', value: stats.wins },
          { name: 'Поражений', value: stats.losses },
          { name: 'Ничьих', value: stats.draws },
        ]}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {[
          stats.wins,
          stats.losses,
          stats.draws,
        ].map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </>
)}
      </div>
    </div>
  );
};

export default StatisticsPage;
