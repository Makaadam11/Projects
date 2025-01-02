"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MentalHealthDashboard from '../../components/Dashboard/MentalHealthDashboard';

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const adminStatus = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    setIsAdmin(adminStatus);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Mental Health Dashboard</h1>
          {isAdmin && (
            <Link href="/admin">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Admin Panel
              </button>
            </Link>
          )}
        </div>
      </nav>
      <MentalHealthDashboard />
    </div>
  );
}