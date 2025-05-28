
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.push('/login');
  }, [router]);

  return <>{children}</>;
}
