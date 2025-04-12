'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Mail, Key, MapPin, Building, Phone, Camera, Shield, ChevronRight, Save, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const SuccessNotification = ({ message }: { message: string }) => (
  <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right duration-300">
    <div className="bg-[#0c1a29] border border-emerald-500/50 shadow-lg rounded-lg p-4 flex items-start max-w-md">
      <div className="flex-shrink-0 mr-3">
        <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
          <Check className="h-5 w-5 text-emerald-500" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-emerald-500">Success</h3>
        <p className="text-sm text-gray-300 mt-1">{message}</p>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    bio: '',
    avatar: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Profile updated successfully!');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password validation errors
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  // Fetch user data from session
  useEffect(() => {
    async function fetchUserData() {
      setIsFetching(true);
      setError('');
      
      try {
        // Wait for session to be loaded
        if (status === 'loading') return;
        
        if (status === 'authenticated' && session?.user) {
          // Use data from session
          setUser({
            name: session.user.name || '',
            email: session.user.email || '',
            phone: session.user.phone || '',
            company: user.company, // Keep existing values for fields not in session
            location: user.location,
            bio: user.bio,
            avatar: session.user.image || '',
          });
        } else if (status === 'unauthenticated') {
          setError('You must be logged in to view this page');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please refresh the page and try again.');
      } finally {
        setIsFetching(false);
      }
    }
    
    fetchUserData();
  }, [session, status, user.bio, user.company, user.location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    try {
      // In a real app, you would submit the form data to your API
      // Example API call would update the user profile data in Supabase
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to refresh the session after password change
  const refreshSession = async (email: string, newPassword: string) => {
    try {
      // First sign out from Supabase client-side
      await supabase.auth.signOut();
      
      // Wait briefly to ensure sign-out is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then sign in again with the new password using NextAuth
      const result = await signIn('credentials', {
        email,
        password: newPassword,
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Error refreshing session after password change:', result.error);
        return false;
      }
      
      // Reload the page to ensure the session is fully refreshed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Reset any existing errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    });
    
    // Validate passwords
    let hasError = false;
    
    if (!passwordForm.currentPassword) {
      setPasswordErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }));
      hasError = true;
    }
    
    if (!passwordForm.newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
      hasError = true;
    } else if (passwordForm.newPassword.length < 8) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
      hasError = true;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasError = true;
    }
    
    if (hasError) {
      setIsLoading(false);
      return;
    }
    
    // Call the API to change password
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle different error cases
        if (response.status === 400 && data.error === 'Current password is incorrect') {
          setPasswordErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }));
        } else {
          setPasswordErrors(prev => ({ ...prev, general: data.error || 'Failed to update password' }));
        }
        setIsLoading(false);
        return;
      }
      
      // Password was updated, now refresh the session to keep user logged in
      if (session?.user?.email) {
        await refreshSession(session.user.email, passwordForm.newPassword);
      }
      
      // Close modal and show success message
      setShowPasswordModal(false);
      setSuccessMessage('Your password has been updated successfully!');
      setShowSuccess(true);
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordErrors(prev => ({ ...prev, general: 'Failed to update password. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 md:px-0 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Profile Settings
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Your personal account information</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {showSuccess && (
        <SuccessNotification message={successMessage} />
      )}
      
      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-glow-cyan-strong">Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                      Name
                    </label>
                    <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <User size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <input
                        type="text"
                        id="name"
                        className="flex-1 bg-transparent focus:outline-none text-white"
                        placeholder="Your name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                      Email
                    </label>
                    <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <Mail size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <input
                        type="email"
                        id="email"
                        className="flex-1 bg-transparent focus:outline-none text-white opacity-70"
                        placeholder="you@example.com"
                        value={user.email}
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                      Phone
                    </label>
                    <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <Phone size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <input
                        type="tel"
                        id="phone"
                        className="flex-1 bg-transparent focus:outline-none text-white"
                        placeholder="Your phone number"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-400">
                      Company
                    </label>
                    <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <Building size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <input
                        type="text"
                        id="company"
                        className="flex-1 bg-transparent focus:outline-none text-white"
                        placeholder="Your company"
                        value={user.company}
                        onChange={(e) => setUser({ ...user, company: e.target.value })}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-400">
                      Location
                    </label>
                    <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <MapPin size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <input
                        type="text"
                        id="location"
                        className="flex-1 bg-transparent focus:outline-none text-white"
                        placeholder="City, Country"
                        value={user.location}
                        onChange={(e) => setUser({ ...user, location: e.target.value })}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
                      Bio
                    </label>
                    <div className="rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                      <textarea
                        id="bio"
                        rows={4}
                        className="w-full bg-transparent focus:outline-none text-white resize-none"
                        placeholder="Write a short bio about yourself..."
                        value={user.bio}
                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                        readOnly={!isEditing}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  {isEditing ? (
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 border border-red-500/50 text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2 inline-block" />
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan rounded-md hover:bg-[#0ff0fc]/30 transition-colors flex items-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 border border-[#0ff0fc]/30 rounded-md hover:bg-[#0ff0fc]/10 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-glow-cyan-strong">Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Password</h4>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2 hover:bg-[#0ff0fc]/10 transition-colors"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <div className="flex items-center">
                      <Key size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <span>Change password</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#0ff0fc]/50" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Two-Factor Authentication</h4>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2 hover:bg-[#0ff0fc]/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <Shield size={18} className="text-[#0ff0fc]/80 mr-2" />
                      <span>Enable 2FA</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#0ff0fc]/50" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-glow-cyan-strong">Profile Picture</CardTitle>
              <CardDescription>Update your profile image</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-[#0a1018] border-2 border-[#0ff0fc]/30 flex items-center justify-center mb-4 overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#0ff0fc]/50" />
                )}
              </div>
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 rounded-md hover:bg-[#0ff0fc]/30 transition-colors flex items-center"
              >
                <Camera size={16} className="mr-2" />
                Upload Image
              </button>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG or GIF, max 2MB</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-glow-cyan-strong mb-2">Change Password</h3>
            <p className="text-sm text-gray-400 mb-4">
              Choose a strong, unique password to protect your account.
            </p>
            
            {passwordErrors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{passwordErrors.general}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400">
                    Current Password
                  </label>
                  <div className={`flex items-center rounded-md border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-[#0ff0fc]/20'} bg-[#0a1018] px-3 py-2`}>
                    <Key size={18} className={`${passwordErrors.currentPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      type="password"
                      id="currentPassword"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400">
                    New Password
                  </label>
                  <div className={`flex items-center rounded-md border ${passwordErrors.newPassword ? 'border-red-500' : 'border-[#0ff0fc]/20'} bg-[#0a1018] px-3 py-2`}>
                    <Key size={18} className={`${passwordErrors.newPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      type="password"
                      id="newPassword"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
                    Confirm New Password
                  </label>
                  <div className={`flex items-center rounded-md border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-[#0ff0fc]/20'} bg-[#0a1018] px-3 py-2`}>
                    <Key size={18} className={`${passwordErrors.confirmPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      type="password"
                      id="confirmPassword"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-[#0ff0fc]/30 rounded-md hover:bg-[#0ff0fc]/10 transition-all w-full sm:w-auto"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan rounded-md hover:bg-[#0ff0fc]/30 transition-all flex items-center justify-center w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 