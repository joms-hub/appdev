"use client";

import Image from "next/image";
import { useState } from "react";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
}

interface ProfileClientProps {
  initialData: ProfileData;
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const { update } = useSession();
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Force image reload

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to server
      const uploadResponse = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Update profile data with new image URL
      setProfileData(prev => ({
        ...prev,
        image: uploadResult.url
      }));

      // Reset image error state and force reload
      setImageError(false);
      setImageKey(prev => prev + 1);

      // Refresh the session to update the profile picture in navigation
      await update();

      setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });

    } catch (error) {
      if (process.env.NODE_ENV === "development") { console.error("Error uploading image:", error); }
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload image. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.email.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Save profile data to server
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Refresh the session to update any profile changes in navigation
      await update();

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

    } catch (error) {
      if (process.env.NODE_ENV === "development") { console.error("Error saving profile:", error); }
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8 pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-8">
          {/* Profile Picture Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              {profileData.image && !imageError ? (
                <div className="relative w-32 h-32 rounded-full border-4 border-gray-600 overflow-hidden">
                  <Image
                    key={imageKey}
                    src={`${profileData.image}?t=${imageKey}`}
                    alt="Profile Picture"
                    fill
                    className="object-cover object-center"
                    onError={() => setImageError(true)}
                    priority
                  />
                </div>
              ) : (
                <FaUserCircle size={120} color="#6B7280" />
              )}
              <label
                htmlFor="profile-upload"
                className={`absolute bottom-0 right-0 rounded-full bg-white p-2 text-black transition-colors ${
                  isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-200'
                }`}
              >
                <FaCamera size={16} />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={() => document.getElementById('profile-upload')?.click()}
              disabled={isLoading}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                isLoading
                  ? 'cursor-not-allowed border-gray-500 bg-gray-700 text-gray-400'
                  : 'border-white bg-transparent text-white hover:bg-white hover:text-black'
              }`}
            >
              {isLoading ? 'Uploading...' : 'Upload New Picture'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Enter your last name"
              />
            </div>

            {/* Email Address */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mt-6 rounded-lg p-4 ${
              message.type === 'success' 
                ? 'bg-green-900 border border-green-600 text-green-300' 
                : 'bg-red-900 border border-red-600 text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/change-password"
                className="rounded-lg border border-gray-500 bg-transparent px-6 py-3 text-center text-gray-300 transition-colors hover:border-white hover:text-white"
              >
                Change Password
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg border border-red-500 bg-transparent px-6 py-3 text-red-400 transition-colors hover:border-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                Logout
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`rounded-lg px-8 py-3 text-lg font-semibold transition-colors ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
