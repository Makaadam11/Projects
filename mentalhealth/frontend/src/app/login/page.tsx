import React from 'react';
import Login from "@/components/Login/Login";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
        <Login />
      </div>
    </div>
  );
}