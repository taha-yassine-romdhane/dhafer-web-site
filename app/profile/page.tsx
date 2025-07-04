'use client';

import { useState, useEffect } from 'react';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPut } from '@/lib/api-client';


interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isSubscribed: boolean;
  fidelityPoints: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Only fetch profile if user is logged in and auth is ready
    if (!authLoading && isLoggedIn) {
      fetchProfile();
    } else if (!authLoading && !isLoggedIn) {
      // Redirect to login if not authenticated
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isLoggedIn, router]);

  const fetchProfile = async () => {
    try {
      // Use apiGet which automatically adds auth token from localStorage
      const data = await apiGet('/api/users/profile');
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        username: data.username,
        email: data.email,
      }));
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Error loading profile. Please try again.');
      
      // If authentication error, redirect to login
      if (err.message?.includes('Authentication')) {
        setTimeout(() => {
          router.push('/login?redirect=/profile');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Use apiPut which automatically adds auth token from localStorage
      await apiPut('/api/users/profile', {
        username: formData.username,
        email: formData.email,
      });
      
      setSuccessMessage('Profile updated successfully');
      await fetchProfile();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error updating profile');
      
      // If authentication error, redirect to login
      if (err.message?.includes('Authentication')) {
        setTimeout(() => {
          router.push('/login?redirect=/profile');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Use apiPut which automatically adds auth token from localStorage
      await apiPut('/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccessMessage('Password changed successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err: any) {
      console.error('Error changing password:', err);
      
      // Show more specific error messages
      if (err.message?.includes('current password')) {
        setError('Current password is incorrect');
      } else if (err.message?.includes('Authentication')) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          router.push('/login?redirect=/profile');
        }, 2000);
      } else {
        setError(err.message || 'Error changing password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3f61]" />
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Requise</h2>
          <p className="mt-2 text-gray-600">Veuillez vous connecter pour consulter votre profil</p>
          <button
            onClick={() => router.push('/login?redirect=/profile')}
            className="mt-4 inline-flex items-center rounded-md bg-[#7c3f61] px-4 py-2 text-white hover:bg-[#B59851] transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres du profil</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérer vos paramètres de compte et vos préférences
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Informations du compte</h2>
              <form onSubmit={handleProfileUpdate} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7c3f61] focus:border-[#7c3f61]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7c3f61] focus:border-[#7c3f61]"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3f61] hover:bg-[#B59851] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3f61] disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Changer le mot de passe</h2>
              <form onSubmit={handlePasswordChange} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Mot de passe actuel
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7c3f61] focus:border-[#7c3f61]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7c3f61] focus:border-[#7c3f61]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7c3f61] focus:border-[#7c3f61]"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3f61] hover:bg-[#B59851] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3f61] disabled:opacity-50"
                  >
                    {loading ? 'Changement du mot de passe...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Statistiques du compte</h2>
              <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-[#7c3f61]/5 rounded-lg p-6">
                  <dt className="text-sm font-medium text-gray-500">Points de fidélité</dt>
                  <dd className="mt-1 text-3xl font-semibold text-[#7c3f61]">
                    {profile?.fidelityPoints || 0}
                  </dd>
                </div>
                <div className="bg-[#7c3f61]/5 rounded-lg p-6">
                  <dt className="text-sm font-medium text-gray-500">Membre depuis</dt>
                  <dd className="mt-1 text-3xl font-semibold text-[#7c3f61]">
                    {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}