"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { saveLoginData } from '../../api/login';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await saveLoginData(data);
      // Redirect to dashboard based on user role
      if (response.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setLoginError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {loginError && <p className="text-red-500">{loginError}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}