"use client";

import { useLoginStats } from "@/hooks/useLoginStats";
import React, { useState } from "react";
import LoginStatsChart from "../components/login-stats-chart";
import { useAdminUsers } from "@/hooks/useAdminUsers";

const AdminUsersPage = () => {
  const { stats, loading: statsLoading, error: statsError } = useLoginStats();
  const {
    users,
    loading,
    error,
    selectedUser,
    modalOpen,
    deleteLoading,
    deleteUser,
    openModal,
    closeModal,
  } = useAdminUsers();

  const [viewMode, setViewMode] = useState<"chart" | "users">("chart");

  if (loading) return <p className="p-6 text-lg">Загрузка...</p>;
  if (error) return <p className="p-6 text-lg text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto text-[#3E2D1F]">
      <h1 className="text-2xl font-semibold mb-6">
        Админка: {viewMode === "chart" ? "Статистика по логинам" : "Список пользователей"}
      </h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setViewMode("chart")}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium ${
            viewMode === "chart" ? "bg-[#3E2D1F]" : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          График
        </button>
        <button
          onClick={() => setViewMode("users")}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium ${
            viewMode === "users" ? "bg-[#3E2D1F]" : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          Пользователи
        </button>
      </div>

      {viewMode === "chart" && !statsLoading && !statsError && <LoginStatsChart data={stats} />}

      {viewMode === "users" && (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full table-auto border border-[#D6C6B8] bg-white">
            <thead className="bg-[#EAE8DF] text-[#3E2D1F]">
              <tr>
                <th className="px-4 py-2 border border-[#D6C6B8]">ID</th>
                <th className="px-4 py-2 border border-[#D6C6B8]">Имя</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#FDFBF6] cursor-pointer"
                  onClick={() => openModal(user.id)}
                >
                  <td className="px-4 py-2 border border-[#D6C6B8]">{user.id}</td>
                  <td className="px-4 py-2 border border-[#D6C6B8]">{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && selectedUser && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
            <p><b>ID:</b> {selectedUser.id}</p>
            <p><b>Имя:</b> {selectedUser.username}</p>

            <hr className="my-4" />

            <p><b>Всего игр:</b> {selectedUser.totalGames}</p>
            <p><b>Побед:</b> {selectedUser.wins}</p>
            <p><b>Поражений:</b> {selectedUser.losses}</p>
            <p><b>Ничьих:</b> {selectedUser.draws}</p>
            <p><b>Текущая серия побед:</b> {selectedUser.currentWinStreak}</p>
            <p><b>Максимальная серия побед:</b> {selectedUser.maxWinStreak}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={deleteUser}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {deleteLoading ? "Удаление..." : "Удалить пользователя"}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
