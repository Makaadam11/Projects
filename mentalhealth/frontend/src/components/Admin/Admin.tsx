"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser, deleteUser } from '../../api/login';

interface RegisterFormInputs {
  email: string;
  password: string;
  isAdmin: boolean;
}

interface DeleteFormInputs {
  deleteEmail: string;
}

export default function AdminPanel() {
  const { 
    register: registerForm, 
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm 
  } = useForm<RegisterFormInputs>();
  
  const { 
    register: deleteForm, 
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm 
  } = useForm<DeleteFormInputs>();

  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const onRegisterSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email.trim(),
        password: data.password.trim(),
        isAdmin: Boolean(data.isAdmin)
      });
      setRegisterSuccess('User registered successfully');
      setRegisterError(null);
      resetRegisterForm();
    } catch (error) {
      setRegisterError('Failed to register user.');
      setRegisterSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteSubmit = async (data: DeleteFormInputs) => {
    setIsLoading(true);
    try {
      await deleteUser(data.deleteEmail.trim());
      setDeleteSuccess('User deleted successfully');
      setDeleteError(null);
      resetDeleteForm();
    } catch (error) {
      setDeleteError('Failed to delete user.');
      setDeleteSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...registerForm('email', { required: 'Email is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...registerForm('password', { required: 'Password is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="isAdmin" className="block text-sm font-medium text-gray-700">
              Is Admin
            </label>
            <input
              id="isAdmin"
              type="checkbox"
              {...registerForm('isAdmin')}
              className="mt-1 block"
              disabled={isLoading}
            />
          </div>
          {registerError && <p className="text-red-500">{registerError}</p>}
          {registerSuccess && <p className="text-green-500">{registerSuccess}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register User'}
          </button>
        </form>

        <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className="space-y-4 mt-8">
          <div>
            <label htmlFor="deleteEmail" className="block text-sm font-medium text-gray-700">
              Email to Delete
            </label>
            <input
              id="deleteEmail"
              type="email"
              {...deleteForm('deleteEmail', { required: 'Email is required' })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          {deleteError && <p className="text-red-500">{deleteError}</p>}
          {deleteSuccess && <p className="text-green-500">{deleteSuccess}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </button>
        </form>
      </div>
    </div>
  );
}