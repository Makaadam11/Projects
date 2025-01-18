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
    <div style={{padding: '0 0.5rem'}}>    
        <button             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-green-700"
 onClick={handleLogout}>
      Logout
    </button>
    </div>

  );
};

export default Logout;