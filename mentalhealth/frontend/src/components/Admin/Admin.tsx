import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../api/login';

interface AdminFormInputs {
  email: string;
  password: string;
  university: string;
  isAdmin: boolean;
}

export const AdminPanel = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<AdminFormInputs>();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: AdminFormInputs) => {
    setIsLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    try {
      await registerUser(data);
      setRegisterSuccess('User registered successfully.');
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Panel</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700">
              University
            </label>
            <select
              id="university"
              {...register('university', { required: 'University is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="ual">UAL</option>
              <option value="sol">SOL</option>
              <option value="all">All</option>
            </select>
            {errors.university && <p className="text-red-500">{errors.university.message}</p>}
          </div>
          <div>
            <label htmlFor="isAdmin" className="block text-sm font-medium text-gray-700">
              Is Admin
            </label>
            <input
              id="isAdmin"
              type="checkbox"
              {...register('isAdmin')}
              className="mt-1 block"
              disabled={isLoading}
            />
          </div>
          {registerError && <p className="text-red-500">{registerError}</p>}
          {registerSuccess && <p className="text-green-500">{registerSuccess}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};