import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Save } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { getProfile, updateProfile, type Profile } from '../../utils/database';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AvatarSelector } from '../common/AvatarSelector';
import { toast } from 'react-toastify';

// Pixelated character components for display
const CHARACTER_COMPONENTS: Record<string, React.ReactNode> = {
  pixel_wizard: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="15" width="40" height="8" fill="#8b5cf6" className="animate-pulse" />
      <rect x="25" y="20" width="50" height="6" fill="#7c3aed" className="animate-pulse" />
      <rect x="20" y="23" width="60" height="4" fill="#6d28d9" className="animate-pulse" />
      <rect x="45" y="10" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="47" y="8" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
      <rect x="42" y="13" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="35" y="30" width="30" height="25" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="50" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="52" width="40" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="30" y="58" width="40" height="25" fill="#3b82f6" className="animate-pulse" />
      <rect x="75" y="20" width="4" height="60" fill="#8b5cf6" className="animate-pulse" />
      <rect x="70" y="15" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="15" y="25" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="85" y="35" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="45" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
    </svg>
  ),
  pixel_knight: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="40" y="25" width="20" height="6" fill="#1f2937" className="animate-pulse" />
      <rect x="42" y="27" width="16" height="2" fill="#374151" className="animate-pulse" />
      <rect x="45" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="52" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="25" y="40" width="50" height="30" fill="#374151" className="animate-pulse" />
      <rect x="30" y="45" width="40" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="55" width="40" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="15" y="45" width="12" height="20" fill="#dc2626" className="animate-pulse" />
      <rect x="17" y="47" width="8" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="19" y="50" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="35" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
    </svg>
  ),
  pixel_ninja: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="35" y="25" width="30" height="20" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="20" width="40" height="8" fill="#374151" className="animate-pulse" />
      <rect x="40" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="56" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="30" y="45" width="40" height="30" fill="#1f2937" className="animate-pulse" />
      <rect x="25" y="50" width="50" height="6" fill="#dc2626" className="animate-pulse" />
      <rect x="27" y="52" width="46" height="2" fill="#ef4444" className="animate-pulse" />
      <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="30" width="8" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="17" y="28" width="4" height="12" fill="#6b7280" className="animate-pulse" />
      <rect x="13" y="32" width="12" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="15" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
      <rect x="85" y="25" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
      <rect x="5" y="35" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
    </svg>
  ),
  pixel_robot: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="25" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="48" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="46" y="8" width="8" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
      <rect x="54" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
      <rect x="42" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="45" y="38" width="10" height="3" fill="#ef4444" className="animate-pulse" />
      <rect x="25" y="45" width="50" height="35" fill="#374151" className="animate-pulse" />
      <rect x="35" y="50" width="30" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="40" y="55" width="20" height="5" fill="#10b981" className="animate-pulse" />
      <rect x="42" y="57" width="16" height="1" fill="#1f2937" className="animate-pulse" />
      <rect x="15" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="73" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="82" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="35" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="53" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="32" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
      <rect x="50" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
    </svg>
  ),
  pixel_archer: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="40" y="15" width="20" height="15" fill="#7c2d12" className="animate-pulse" />
      <rect x="42" y="12" width="16" height="6" fill="#92400e" className="animate-pulse" />
      <rect x="55" y="10" width="8" height="12" fill="#dc2626" className="animate-pulse" />
      <rect x="57" y="8" width="4" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="35" y="30" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="57" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="53" width="40" height="25" fill="#059669" className="animate-pulse" />
      <rect x="15" y="40" width="12" height="25" fill="#7c2d12" className="animate-pulse" />
      <rect x="17" y="42" width="8" height="21" fill="#92400e" className="animate-pulse" />
      <rect x="18" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="21" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="24" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#7c2d12" className="animate-pulse" />
      <rect x="70" y="35" width="14" height="4" fill="#92400e" className="animate-pulse" />
      <rect x="72" y="33" width="10" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="76" y="32" width="2" height="36" fill="#1f2937" className="animate-pulse" />
    </svg>
  ),
  pixel_mage: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="10" width="40" height="12" fill="#7c3aed" className="animate-pulse" />
      <rect x="25" y="18" width="50" height="8" fill="#6d28d9" className="animate-pulse" />
      <rect x="20" y="22" width="60" height="6" fill="#5b21b6" className="animate-pulse" />
      <rect x="45" y="5" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="47" y="3" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
      <rect x="42" y="8" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="35" y="28" width="30" height="22" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="47" width="40" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="50" width="50" height="35" fill="#3b82f6" className="animate-pulse" />
      <rect x="75" y="15" width="4" height="70" fill="#8b5cf6" className="animate-pulse" />
      <rect x="70" y="10" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="8" width="10" height="6" fill="#f59e0b" className="animate-pulse" />
      <rect x="68" y="25" width="8" height="8" fill="#10b981" className="animate-pulse" />
      <rect x="70" y="27" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="15" y="20" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="85" y="30" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="40" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="90" y="50" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
    </svg>
  ),
  pixel_pirate: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="25" y="15" width="50" height="12" fill="#1f2937" className="animate-pulse" />
      <rect x="20" y="20" width="60" height="8" fill="#374151" className="animate-pulse" />
      <rect x="30" y="22" width="40" height="4" fill="#dc2626" className="animate-pulse" />
      <rect x="35" y="25" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="30" width="8" height="6" fill="#1f2937" className="animate-pulse" />
      <rect x="42" y="28" width="4" height="10" fill="#1f2937" className="animate-pulse" />
      <rect x="52" y="32" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="53" width="40" height="30" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="58" width="30" height="20" fill="#92400e" className="animate-pulse" />
      <rect x="45" y="65" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="45" y="70" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="45" y="75" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="15" y="50" width="8" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="52" width="8" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="5" y="70" width="8" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="6" y="72" width="6" height="4" fill="#f59e0b" className="animate-pulse" />
    </svg>
  ),
  pixel_elf: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="35" y="10" width="30" height="15" fill="#059669" className="animate-pulse" />
      <rect x="30" y="20" width="40" height="8" fill="#047857" className="animate-pulse" />
      <rect x="48" y="5" width="4" height="8" fill="#dc2626" className="animate-pulse" />
      <rect x="46" y="3" width="8" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="35" y="28" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="30" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
      <rect x="64" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
      <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="42" y="45" width="16" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="48" width="40" height="35" fill="#059669" className="animate-pulse" />
      <rect x="35" y="53" width="30" height="25" fill="#047857" className="animate-pulse" />
      <rect x="32" y="60" width="36" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="75" y="25" width="4" height="35" fill="#7c2d12" className="animate-pulse" />
      <rect x="70" y="20" width="14" height="6" fill="#92400e" className="animate-pulse" />
      <rect x="72" y="18" width="10" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="76" y="15" width="2" height="25" fill="#6b7280" className="animate-pulse" />
      <rect x="75" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="30" width="4" height="4" fill="#10b981" className="animate-pulse" />
      <rect x="85" y="40" width="4" height="4" fill="#10b981" className="animate-pulse" />
      <rect x="5" y="50" width="4" height="4" fill="#10b981" className="animate-pulse" />
    </svg>
  ),
  pixel_dwarf: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="69" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="35" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="47" width="4" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="50" width="36" height="12" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="52" width="40" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="62" width="50" height="25" fill="#7c2d12" className="animate-pulse" />
      <rect x="30" y="67" width="40" height="15" fill="#92400e" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="68" y="27" width="18" height="6" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="50" width="12" height="20" fill="#dc2626" className="animate-pulse" />
      <rect x="17" y="52" width="8" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="19" y="55" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="30" y="75" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
      <rect x="53" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
    </svg>
  ),
  pixel_samurai: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="15" width="40" height="20" fill="#1f2937" className="animate-pulse" />
      <rect x="35" y="10" width="30" height="8" fill="#374151" className="animate-pulse" />
      <rect x="45" y="5" width="10" height="8" fill="#dc2626" className="animate-pulse" />
      <rect x="47" y="3" width="6" height="12" fill="#ef4444" className="animate-pulse" />
      <rect x="40" y="25" width="20" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="42" y="27" width="16" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="45" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="52" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="25" y="35" width="50" height="35" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="40" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="30" y="50" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="30" y="60" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="40" width="3" height="30" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="35" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="12" y="33" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="30" y="65" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="53" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="32" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
      <rect x="50" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
    </svg>
  )
};

const getCharacterGradient = (characterId: string): string => {
  const gradients: Record<string, string> = {
    pixel_wizard: 'from-purple-500 to-indigo-600',
    pixel_knight: 'from-gray-600 to-gray-800',
    pixel_ninja: 'from-gray-800 to-black',
    pixel_robot: 'from-gray-500 to-gray-700',
    pixel_archer: 'from-green-600 to-emerald-700',
    pixel_mage: 'from-blue-500 to-purple-600',
    pixel_pirate: 'from-red-600 to-orange-700',
    pixel_elf: 'from-green-500 to-emerald-600',
    pixel_dwarf: 'from-orange-600 to-red-700',
    pixel_samurai: 'from-gray-800 to-black'
  };
  return gradients[characterId] || 'from-blue-500 to-blue-600';
};

export const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    allergies: ''
  });
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
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
          avatar_url: profileData.avatar_url || '',
          allergies: profileData.allergies || ''
        });
        // Set custom URL if the avatar_url is a valid URL
        if (profileData.avatar_url && profileData.avatar_url.startsWith('http')) {
          setCustomAvatarUrl(profileData.avatar_url);
        } else {
          setCustomAvatarUrl('');
        }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setCustomAvatarUrl(''); // Clear custom URL when character is selected
    setShowAvatarSelector(false);
    toast.success('Avatar selected!');
  };

  const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCustomAvatarUrl(value);
    // Only set avatar_url if it's a valid URL (not a character ID)
    if (value.startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        avatar_url: value
      }));
    } else if (value === '') {
      // Clear avatar_url if custom URL is empty
      setFormData(prev => ({
        ...prev,
        avatar_url: ''
      }));
    }
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Minimal Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
              Edit Profile
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Update your personal information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Camera className="text-blue-400" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Profile Picture</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className={`w-24 h-24 bg-gradient-to-br ${getCharacterGradient(formData.avatar_url)} rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/20 ring-offset-2 ring-offset-slate-950`}>
                  {formData.avatar_url && CHARACTER_COMPONENTS[formData.avatar_url] ? (
                    CHARACTER_COMPONENTS[formData.avatar_url]
                  ) : (
                    <User className="text-white" size={40} />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/20"
                    >
                      <Camera size={18} />
                      Choose Avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, avatar_url: '' }));
                        setCustomAvatarUrl('');
                      }}
                      className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl hover:bg-slate-700/50 transition-all duration-200 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Custom URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Or enter custom URL
                    </label>
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={handleCustomAvatarChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50 text-white placeholder-slate-500 text-lg font-semibold"
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
          </div>

          {/* Personal Information */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <User className="text-emerald-400" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white placeholder-slate-500 text-lg font-semibold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full p-4 border border-slate-700/50 rounded-2xl bg-slate-800/50 text-slate-500 cursor-not-allowed text-lg font-semibold"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Allergies & Dietary Restrictions
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="e.g., Peanuts, Dairy, Gluten, Shellfish..."
                    rows={4}
                    className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white placeholder-slate-500 text-lg font-semibold resize-none"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    List any food allergies or dietary restrictions separated by commas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-4 text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 rounded-2xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg shadow-emerald-500/20"
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