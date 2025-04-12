'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Bell, Moon, Globe, Shield, Eye, AlertCircle, Loader2, Star, Gem, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { User, Key, CreditCard, Save, Trash2, ExternalLink, Check } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { subscription } = useSubscription();
  const [activeTab, setActiveTab] = useState('account');
  const { data: session } = useSession();
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Security tab states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    productUpdates: true,
    marketingEmails: false,
    usageReminders: true
  });
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  
  // Load user profile from session
  useEffect(() => {
    if (session?.user) {
      setUserProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        avatar: session.user.image || ''
      });
    }
  }, [session]);
  
  // Update profile handler
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setIsProfileLoading(true);
    
    try {
      // In a real implementation, we would call an API to update the user profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProfileSuccess(true);
      setIsEditingProfile(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    });
    setPasswordSuccess(false);
    setIsPasswordLoading(true);
    
    // Validate inputs
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
      setIsPasswordLoading(false);
      return;
    }
    
    try {
      // Call the API to change password
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
        setIsPasswordLoading(false);
        return;
      }
      
      // Password updated successfully
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordErrors(prev => ({ ...prev, general: 'An unexpected error occurred. Please try again.' }));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle notification preferences change
  const handleNotificationChange = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Handle save notification preferences
  const handleSaveNotifications = async () => {
    setIsNotificationLoading(true);
    setNotificationSuccess(false);
    
    try {
      // In a real implementation, we would call an API to update notification preferences
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setNotificationSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setNotificationSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Settings
          </span>
        </h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-1/2 bg-[#0a1018] rounded-lg">
          <TabsTrigger 
            value="account" 
            className={`data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-glow-cyan-strong`}
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className={`data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-glow-cyan-strong`}
          >
            <Key className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className={`data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-glow-cyan-strong`}
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className={`data-[state=active]:bg-[#0ff0fc]/20 data-[state=active]:text-glow-cyan-strong`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="mt-4">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{profileError}</span>
                  </div>
                </div>
              )}
              
              {profileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 text-sm">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Your profile has been updated successfully!</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full rounded-md bg-[#0a1018] border border-[#0ff0fc]/30 p-2 text-white focus:border-[#0ff0fc] focus:ring-1 focus:ring-[#0ff0fc] transition-all"
                      readOnly={!isEditingProfile}
                      disabled={isProfileLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                      value={userProfile.email}
                      className="w-full rounded-md bg-[#0a1018] border border-[#0ff0fc]/30 p-2 text-white focus:border-[#0ff0fc] focus:ring-1 focus:ring-[#0ff0fc] transition-all opacity-70"
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full rounded-md bg-[#0a1018] border border-[#0ff0fc]/30 p-2 text-white focus:border-[#0ff0fc] focus:ring-1 focus:ring-[#0ff0fc] transition-all"
                      readOnly={!isEditingProfile}
                      disabled={isProfileLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400" htmlFor="avatar">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-[#0a1018] border border-[#0ff0fc]/30 flex items-center justify-center overflow-hidden">
                        {userProfile.avatar ? (
                          <img src={userProfile.avatar} alt={userProfile.name} className="h-full w-full object-cover" />
                        ) : (
                      <User className="h-8 w-8 text-[#0ff0fc]" />
                        )}
                    </div>
                      <button 
                        type="button"
                        className="px-3 py-1.5 bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/30 transition-all text-glow-cyan-strong"
                        disabled={!isEditingProfile || isProfileLoading}
                      >
                      Change
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                  {isEditingProfile ? (
                    <>
                      <button 
                        type="button" 
                        className="px-4 py-2 border border-red-500/30 text-red-400 rounded-md text-sm hover:bg-red-500/10 transition-all"
                        onClick={() => setIsEditingProfile(false)}
                        disabled={isProfileLoading}
                      >
                        Cancel
                </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center"
                        disabled={isProfileLoading}
                      >
                        {isProfileLoading ? (
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
                    </>
                  ) : (
                    <button 
                      type="button" 
                      className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                </button>
                  )}
              </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Subscription Information in Account Tab */}
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Subscription Status</span>
                <Link href="/dashboard/billing" className="text-xs bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 px-3 py-1.5 rounded text-[#0ff0fc] hover:bg-[#0ff0fc]/30 transition-all flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Manage Subscription
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center">
                  {subscription.plan === 'free' && <Star className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'pro' && <Gem className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'enterprise' && <Shield className="h-5 w-5 text-[#0ff0fc]" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glow-cyan-strong">
                    {subscription.plan === 'free' && "Free Plan"}
                    {subscription.plan === 'pro' && "Pro Plan"}
                    {subscription.plan === 'enterprise' && "Enterprise Plan"}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {subscription.plan === 'free' 
                      ? "Limited features with daily usage caps" 
                      : subscription.status === 'active' 
                        ? "Full access to premium features" 
                        : subscription.status === 'canceled' 
                          ? "Access until the current period ends" 
                          : "Subscription requires attention"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10">
                  <div className="text-sm text-gray-400">Daily Homework Solves</div>
                  <div className="text-lg font-medium text-white">
                    {subscription.plan === 'free' ? "2/day" : "Unlimited"}
                  </div>
                </div>
                
                <div className="p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10">
                  <div className="text-sm text-gray-400">Essay Generation</div>
                  <div className="text-lg font-medium text-white">
                    {subscription.plan === 'free' ? "2/day" : "Unlimited"}
                  </div>
                </div>
              </div>
              
              {subscription.plan !== 'free' && subscription.current_period_end && (
                <div className="p-3 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10 mb-4">
                  <div className="text-sm text-gray-400">
                    {subscription.status === 'canceled' ? 'Access Until' : 'Next Billing Date'}
                  </div>
                  <div className="text-lg font-medium text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#0ff0fc]" />
                    {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-glow-cyan-strong">Change Password</h3>
                <p className="text-sm text-gray-400">Update your password to maintain account security</p>
                
                {passwordErrors.general && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{passwordErrors.general}</span>
                    </div>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 text-sm">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Your password has been updated successfully!</span>
                    </div>
                  </div>
                )}
                
                <form className="grid grid-cols-1 gap-4 mt-4" onSubmit={handlePasswordChange}>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400" htmlFor="current-password">
                      Current Password
                    </label>
                    <div className={`flex items-center rounded-md bg-[#0a1018] border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-[#0ff0fc]/30'} px-3 py-2`}>
                      <Key size={18} className={`${passwordErrors.currentPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                        className="w-full bg-transparent focus:outline-none text-white"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        disabled={isPasswordLoading}
                    />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400" htmlFor="new-password">
                      New Password
                    </label>
                    <div className={`flex items-center rounded-md bg-[#0a1018] border ${passwordErrors.newPassword ? 'border-red-500' : 'border-[#0ff0fc]/30'} px-3 py-2`}>
                      <Key size={18} className={`${passwordErrors.newPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                        className="w-full bg-transparent focus:outline-none text-white"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        disabled={isPasswordLoading}
                    />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400" htmlFor="confirm-password">
                      Confirm New Password
                    </label>
                    <div className={`flex items-center rounded-md bg-[#0a1018] border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-[#0ff0fc]/30'} px-3 py-2`}>
                      <Key size={18} className={`${passwordErrors.confirmPassword ? 'text-red-400' : 'text-[#0ff0fc]/80'} mr-2`} />
                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                        className="w-full bg-transparent focus:outline-none text-white"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        disabled={isPasswordLoading}
                    />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center justify-center"
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                    Update Password
                        </>
                      )}
                  </button>
                </div>
                </form>
              </div>
              
              <div className="border-t border-[#0ff0fc]/10 pt-6 mt-6">
                <h3 className="text-lg font-medium text-glow-cyan-strong">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                
                <div className="flex justify-between items-center bg-[#0a1018] p-4 rounded-md border border-[#0ff0fc]/10">
                  <div>
                    <h4 className="font-medium text-white">Enable 2FA</h4>
                    <p className="text-xs text-gray-400">Use an authenticator app to enhance your security</p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/30 transition-all text-glow-cyan-strong">
                    Setup
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationSuccess && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 text-sm">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Your notification preferences have been updated successfully!</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#0ff0fc]/10">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-xs text-gray-400">Receive updates about your account via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationPrefs.emailNotifications} 
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a1018] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#0ff0fc] after:border-[#0ff0fc] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a1018] peer-checked:border-[#0ff0fc]"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-[#0ff0fc]/10">
                  <div>
                    <h3 className="font-medium text-white">Product Updates</h3>
                    <p className="text-xs text-gray-400">Receive notifications about new features and improvements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationPrefs.productUpdates} 
                      onChange={() => handleNotificationChange('productUpdates')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a1018] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#0ff0fc] after:border-[#0ff0fc] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a1018] peer-checked:border-[#0ff0fc]"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-[#0ff0fc]/10">
                  <div>
                    <h3 className="font-medium text-white">Marketing Emails</h3>
                    <p className="text-xs text-gray-400">Receive promotional offers and marketing communications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationPrefs.marketingEmails} 
                      onChange={() => handleNotificationChange('marketingEmails')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a1018] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a1018] peer-checked:border-[#0ff0fc]"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <div>
                    <h3 className="font-medium text-white">Usage Reminders</h3>
                    <p className="text-xs text-gray-400">Receive reminders about your daily usage limits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationPrefs.usageReminders} 
                      onChange={() => handleNotificationChange('usageReminders')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a1018] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#0ff0fc] after:border-[#0ff0fc] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a1018] peer-checked:border-[#0ff0fc]"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end">
                <button 
                  className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center"
                  onClick={handleSaveNotifications}
                  disabled={isNotificationLoading}
                >
                  {isNotificationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-4">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Subscription Details</span>
                <Link href="/dashboard/billing" className="text-xs bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 px-3 py-1.5 rounded text-[#0ff0fc] hover:bg-[#0ff0fc]/30 transition-all flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Billing
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center">
                  {subscription.plan === 'free' && <Star className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'pro' && <Gem className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'enterprise' && <Shield className="h-5 w-5 text-[#0ff0fc]" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glow-cyan-strong">
                    {subscription.plan === 'free' && "Free Plan"}
                    {subscription.plan === 'pro' && "Pro Plan"}
                    {subscription.plan === 'enterprise' && "Enterprise Plan"}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {subscription.plan === 'free' 
                      ? "Limited access with daily usage caps" 
                      : subscription.status === 'active' 
                        ? "Active subscription with full access"
                        : subscription.status === 'canceled' 
                          ? "Subscription will end at the current period end"
                          : "Subscription requires attention"}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#0a1018] rounded-md border border-[#0ff0fc]/10 p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Plan Details</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white font-medium">
                      {subscription.plan === 'free' && "Free"}
                      {subscription.plan === 'pro' && "Pro ($9.99/month)"}
                      {subscription.plan === 'enterprise' && "Enterprise ($29.99/month)"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`${
                      subscription.status === 'active' ? 'text-green-400' : 
                      subscription.status === 'canceled' ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {subscription.status === 'active' && 'Active'}
                      {subscription.status === 'canceled' && 'Canceled'}
                      {subscription.status === 'past_due' && 'Past Due'}
                      {subscription.status === 'trialing' && 'Trial'}
                    </span>
                  </div>
                  
                  {subscription.plan !== 'free' && subscription.current_period_end && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {subscription.status === 'canceled' ? 'Access Until' : 'Renewal Date'}
                      </span>
                      <span className="text-white">
                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payment Method</span>
                    <span className="text-white">
                      {subscription.plan === 'free' || !subscription.stripe_customer_id
                        ? "None" 
                        : "Visa ending in ****"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {subscription.plan === 'free' ? (
                  <Link 
                    href="/dashboard/billing#plans" 
                    className="w-full py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/dashboard/billing" 
                      className="w-full py-2.5 bg-transparent border border-[#0ff0fc]/30 rounded-md hover:bg-[#0ff0fc]/10 transition-all flex items-center justify-center"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment Methods
                    </Link>
                    {subscription.status === 'active' && (
                      <Link 
                        href="/dashboard/billing" 
                        className="w-full py-2.5 bg-transparent border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/10 transition-all flex items-center justify-center"
                      >
                      Cancel Subscription
                      </Link>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 