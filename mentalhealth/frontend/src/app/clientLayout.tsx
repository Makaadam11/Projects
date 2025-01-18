'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const publicRoutes = ['/login', '/', '/ual', '/sol'];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning>
      <main className="min-h-screen">
        {publicRoutes.includes(pathname) ? (
          children
        ) : (
          <ProtectedRoute>{children}</ProtectedRoute>
        )}
      </main>
    </div>
  );
}