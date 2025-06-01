import { useState, useEffect } from "react";

export interface User {
  id: number;
  username: string;
}

export interface PlayerStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  maxWinStreak: number;
}

export interface UserDetails extends User, PlayerStatistics {}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/players/all");
      if (!res.ok) throw new Error("Ошибка при загрузке пользователей");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/players/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка при удалении пользователя");
      await fetchUsers();
      closeModal();
    } catch (err: any) {
      alert(err.message || "Ошибка");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = async (userId: number) => {
    try {
      const resUser = await fetch(`/api/players/${userId}`);
      if (!resUser.ok) throw new Error("Ошибка при загрузке информации о пользователе");
      const userData: User = await resUser.json();

      const resStats = await fetch(`/api/games/stats/${userData.username}`);
      if (!resStats.ok) throw new Error("Ошибка при загрузке статистики пользователя");
      const statsData: PlayerStatistics = await resStats.json();

      const fullUser: UserDetails = {
        ...userData,
        ...statsData,
      };

      setSelectedUser(fullUser);
      setModalOpen(true);
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return {
    users,
    loading,
    error,
    selectedUser,
    modalOpen,
    deleteLoading,
    fetchUsers,
    deleteUser,
    openModal,
    closeModal,
  };
}
