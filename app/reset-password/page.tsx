"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        setIsTokenValid(response.ok);
      } catch (error) {
        if (process.env.NODE_ENV === "development") { console.error("Error verifying token:", error); }
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate passwords
      if (!formData.password) {
        throw new Error('Password is required');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!formData.confirmPassword) {
        throw new Error('Please confirm your password');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Call API to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setMessage({ 
        type: 'success', 
        text: 'Password reset successfully! You can now sign in with your new password.' 
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      if (process.env.NODE_ENV === "development") { console.error("Error resetting password:", error); }
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to reset password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Loading state
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="mx-auto max-w-md w-full">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Reset Link</h1>
            <p className="text-gray-300 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <div className="space-y-4">
              <Link
                href="/forgot-password"
                className="block w-full rounded-lg bg-white px-4 py-2 text-center text-black transition-colors hover:bg-gray-200"
              >
                Request New Reset Link
              </Link>
              <Link
                href="/login"
                className="block w-full rounded-lg border border-gray-500 bg-transparent px-4 py-2 text-center text-gray-300 transition-colors hover:border-white hover:text-white"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="mx-auto max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">Enter your new password</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Enter new password (min. 8 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
              <p className="font-medium mb-1">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                  At least 8 characters long
                </li>
                <li className={formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-400' : ''}>
                  Passwords match
                </li>
              </ul>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`rounded-lg p-4 ${
                message.type === 'success' 
                  ? 'bg-green-900 border border-green-600 text-green-300'
                  : 'bg-red-900 border border-red-600 text-red-300'
              }`}>
                {message.text}
                {message.type === 'success' && (
                  <p className="text-sm mt-2">Redirecting to login page...</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || message?.type === 'success'}
              className={`w-full rounded-lg px-4 py-3 text-lg font-semibold transition-colors ${
                isLoading || message?.type === 'success'
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
