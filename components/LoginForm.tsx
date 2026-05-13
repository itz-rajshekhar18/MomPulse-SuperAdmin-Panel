'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/auth';
import { ShieldIcon, LockIcon, MailIcon, ArrowRightIcon, InfoIcon } from './Icons';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await loginAdmin(email, password);
      console.log('Login successful:', user);
      // Redirect to dashboard or 2FA page
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.code === 'auth/user-not-found' 
        ? 'Admin user not found'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : err.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <ShieldIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Super Admin Login</h1>
          <p className="text-sm text-gray-600 text-center">
            Enter your credentials to access the MomPulse Console
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Admin Email
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mompulse.admin"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Security Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? 'Logging in...' : 'Enter Console'}
            {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
          </button>
        </form>

        {/* 2FA Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Multi-Factor Authentication (2FA) will be required upon the next step to verify your administrative identity.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Forgot Access?
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-700">
            Security Logs
          </a>
        </div>
      </div>
    </div>
  );
}
