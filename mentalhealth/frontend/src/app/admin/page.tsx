"use client"
import React from 'react';
import Link from 'next/link';
import {AdminPanel} from "@/components/Admin/Admin";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Dashboard
            </button>
          </Link>
        </div>
      </nav>
      <div className="container mx-auto p-8">
        <AdminPanel />
      </div>
    </div>
  );
}