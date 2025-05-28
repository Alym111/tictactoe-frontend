"use client";
import { useState, useEffect } from 'react';
import { getToken } from '../app/auth';

interface User {
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const token = getToken();
      if (!token) {
        console.log('No token found, setting user to null');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user with token:', token);
        const response = await fetch('http://localhost:8080/api/players/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch user, status:', response.status, 'message:', errorText);
          throw new Error(`Failed to fetch user: ${response.status} ${errorText}`);
        }

        const userData = await response.json();
        console.log('User data received:', userData);
        setUser({ username: userData.username });
        setError(null);
      } catch (error: any) {
        console.error('Error fetching user:', error.message);
        setError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}