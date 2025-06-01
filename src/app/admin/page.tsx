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

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Админка: {viewMode === "chart" ? "Статистика по логинам" : "Список пользователей"}</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setViewMode("chart")}
          style={{
            marginRight: 10,
            padding: "8px 16px",
            backgroundColor: viewMode === "chart" ? "#1284d8" : "#ccc",
            color: viewMode === "chart" ? "white" : "black",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          График
        </button>
        <button
          onClick={() => setViewMode("users")}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === "users" ? "#1284d8" : "#ccc",
            color: viewMode === "users" ? "white" : "black",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Пользователи
        </button>
      </div>

      {viewMode === "chart" && !statsLoading && !statsError && <LoginStatsChart data={stats} />}

      {viewMode === "users" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Имя</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{ cursor: "pointer" }}
                onClick={() => openModal(user.id)}
              >
                <td style={{ border: "1px solid black", padding: "8px" }}>{user.id}</td>
                <td style={{ border: "1px solid black", padding: "8px" }}>{user.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            opacity: modalOpen ? 1 : 0,
            pointerEvents: modalOpen ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 12,
              minWidth: 320,
              maxWidth: "90vw",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              transform: modalOpen ? "translateY(0)" : "translateY(-20px)",
              transition: "transform 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Информация о пользователе</h2>
            <p><b>ID:</b> {selectedUser.id}</p>
            <p><b>Имя:</b> {selectedUser.username}</p>

            <hr style={{ margin: "20px 0" }} />

            <p><b>Всего игр:</b> {selectedUser.totalGames}</p>
            <p><b>Побед:</b> {selectedUser.wins}</p>
            <p><b>Поражений:</b> {selectedUser.losses}</p>
            <p><b>Ничьих:</b> {selectedUser.draws}</p>
            <p><b>Текущая серия побед:</b> {selectedUser.currentWinStreak}</p>
            <p><b>Максимальная серия побед:</b> {selectedUser.maxWinStreak}</p>

            <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={deleteUser}
                disabled={deleteLoading}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                }}
              >
                {deleteLoading ? "Удаление..." : "Удалить пользователя"}
              </button>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: "#ccc",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
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
