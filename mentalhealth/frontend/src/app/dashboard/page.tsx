"use client"
import React from 'react';
import Link from 'next/link';
import MentalHealthDashboard from '../../components/Dashboard/MentalHealthDashboard';

export default function DashboardPage() {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Mental Health Dashboard</h1>
            <Link href="/admin">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Admin Panel
              </button>
            </Link>
          </div>
        </nav>
        <MentalHealthDashboard />
      </div>
    );
  }