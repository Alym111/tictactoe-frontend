"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user, redirecting to /login');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Проверка авторизации...</div>;
  }

  return user ? <>{children}</> : null;
}