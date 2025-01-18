'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Logout: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('university');
    router.push('/login');
  };

  return (
    <div>    <button onClick={handleLogout} className="text-red-500">
      Logout
    </button>
    </div>

  );
};

export default Logout;