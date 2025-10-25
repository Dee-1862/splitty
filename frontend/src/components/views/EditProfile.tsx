import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Save } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { getProfile, updateProfile, type Profile } from '../../utils/database';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AvatarSelector } from '../common/AvatarSelector';
import { toast } from 'react-toastify';

export const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  });
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (fetchingRef.current || !user) return; // Prevent multiple simultaneous fetches

    try {
      console.log('fetchProfile called, user ID:', user.id);
      fetchingRef.current = true;
      setLoading(true);
      const profileData = await getProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          avatar_url: profileData.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]); // Only depend on user ID

  useEffect(() => {
    console.log('EditProfile useEffect triggered, user:', user);
    if (user) {
      console.log('User found, fetching profile...');
      fetchProfile();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user?.id, fetchProfile]); // Include fetchProfile in dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      setSaving(true);
      const updatedProfile = await updateProfile(user.id, formData);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Profile updated successfully!');
        navigate('/profile');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
    setShowAvatarSelector(false);
    toast.success('Avatar selected!');
  };

  const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      avatar_url: value
    }));
  };

  // Debug info
  console.log('Rendering EditProfile with:', { 
    loading, 
    user: !!user, 
    profile: !!profile,
    fetching: fetchingRef.current
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Profile" 
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <User className="text-gray-400" size={40} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Camera size={16} />
                    Choose Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Custom URL Input */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Or enter custom URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={handleCustomAvatarChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selector Modal */}
            <AvatarSelector
              isOpen={showAvatarSelector}
              onClose={() => setShowAvatarSelector(false)}
              onSelect={handleAvatarSelect}
              currentAvatarUrl={formData.avatar_url}
            />
          </div>

          {/* Personal Information */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-3 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
