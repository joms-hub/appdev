"use client";

import { useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate email
      if (!email) {
        throw new Error('Email address is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call API to send reset email
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email');
      }

      setIsSubmitted(true);
      setMessage({ 
        type: 'success', 
        text: 'If an account with that email exists, we\'ve sent you password reset instructions.' 
      });

    } catch (error) {
      if (process.env.NODE_ENV === "development") { console.error("Error sending reset email:", error); }
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="mx-auto max-w-md w-full">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-gray-300 mb-6">
              If an account with that email exists, we&apos;ve sent you password reset instructions.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Didn&apos;t receive an email? Check your spam folder or try again with a different email address.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  setMessage(null);
                }}
                className="w-full rounded-lg border border-gray-500 bg-transparent px-4 py-2 text-gray-300 transition-colors hover:border-white hover:text-white"
              >
                Try Different Email
              </button>
              <Link
                href="/login"
                className="block w-full rounded-lg bg-white px-4 py-2 text-center text-black transition-colors hover:bg-gray-200"
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
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft size={16} />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-gray-400">Enter your email to receive reset instructions</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Error Message */}
            {message && message.type === 'error' && (
              <div className="rounded-lg p-4 bg-red-900 border border-red-600 text-red-300">
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg px-4 py-3 text-lg font-semibold transition-colors ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
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
