import { useState, useEffect } from "react";

interface PlayerStatistics {
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak?: number;
  maxWinStreak?: number;
}

const usePlayerStatistics = (username: string) => {
  const [stats, setStats] = useState<PlayerStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:8080/api/games/stats/${username}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка при загрузке статистики");
        }
        return res.json();
      })
      .then((data: PlayerStatistics) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  return { stats, loading, error };
};

export function usePlayersStatistics() {
  const [players, setPlayers] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8080/api/games/stats");
        if (!response.ok) {
          throw new Error("Ошибка при загрузке рейтинга");
        }
        const data: PlayerStatistics[] = await response.json();
        setPlayers(data);
      } catch (err: any) {
        setError(err.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { players, loading, error };
}


export default usePlayerStatistics;
