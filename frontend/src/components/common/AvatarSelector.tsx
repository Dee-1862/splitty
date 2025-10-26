import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';

// Pixelated art-style avatars - retro and artistic
const ANIMATED_CHARACTERS = [
  {
    id: 'pixel_wizard',
    name: 'Wizard',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hat */}
        <rect x="30" y="15" width="40" height="8" fill="#8b5cf6" className="animate-pulse" />
        <rect x="25" y="20" width="50" height="6" fill="#7c3aed" className="animate-pulse" />
        <rect x="20" y="23" width="60" height="4" fill="#6d28d9" className="animate-pulse" />
        {/* Hat star */}
        <rect x="45" y="10" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
        <rect x="47" y="8" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
        <rect x="42" y="13" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
        {/* Head */}
        <rect x="35" y="30" width="30" height="25" fill="#fbbf24" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        <rect x="56" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
        {/* Beard */}
        <rect x="32" y="50" width="36" height="8" fill="#6b7280" className="animate-pulse" />
        <rect x="30" y="52" width="40" height="4" fill="#4b5563" className="animate-pulse" />
        {/* Body */}
        <rect x="30" y="58" width="40" height="25" fill="#3b82f6" className="animate-pulse" />
        {/* Staff */}
        <rect x="75" y="20" width="4" height="60" fill="#8b5cf6" className="animate-pulse" />
        <rect x="70" y="15" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
        {/* Magic sparkles */}
        <rect x="15" y="25" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="85" y="35" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="10" y="45" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      </svg>
    ),
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'pixel_knight',
    name: 'Knight',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Helmet */}
        <rect x="30" y="20" width="40" height="20" fill="#6b7280" className="animate-pulse" />
        <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
        {/* Visor */}
        <rect x="40" y="25" width="20" height="6" fill="#1f2937" className="animate-pulse" />
        <rect x="42" y="27" width="16" height="2" fill="#374151" className="animate-pulse" />
        {/* Eyes */}
        <rect x="45" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="52" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        {/* Body */}
        <rect x="25" y="40" width="50" height="30" fill="#374151" className="animate-pulse" />
        {/* Armor details */}
        <rect x="30" y="45" width="40" height="4" fill="#6b7280" className="animate-pulse" />
        <rect x="30" y="55" width="40" height="4" fill="#6b7280" className="animate-pulse" />
        {/* Shield */}
        <rect x="15" y="45" width="12" height="20" fill="#dc2626" className="animate-pulse" />
        <rect x="17" y="47" width="8" height="16" fill="#ef4444" className="animate-pulse" />
        <rect x="19" y="50" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
        {/* Sword */}
        <rect x="75" y="30" width="4" height="35" fill="#6b7280" className="animate-pulse" />
        <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
      </svg>
    ),
    color: 'from-gray-600 to-gray-800'
  },
  {
    id: 'pixel_ninja',
    name: 'Ninja',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Mask */}
        <rect x="35" y="25" width="30" height="20" fill="#1f2937" className="animate-pulse" />
        <rect x="30" y="20" width="40" height="8" fill="#374151" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
        <rect x="56" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
        {/* Body */}
        <rect x="30" y="45" width="40" height="30" fill="#1f2937" className="animate-pulse" />
        {/* Belt */}
        <rect x="25" y="50" width="50" height="6" fill="#dc2626" className="animate-pulse" />
        <rect x="27" y="52" width="46" height="2" fill="#ef4444" className="animate-pulse" />
        {/* Katana */}
        <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
        <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
        {/* Shuriken */}
        <rect x="15" y="30" width="8" height="8" fill="#6b7280" className="animate-pulse" />
        <rect x="17" y="28" width="4" height="12" fill="#6b7280" className="animate-pulse" />
        <rect x="13" y="32" width="12" height="4" fill="#6b7280" className="animate-pulse" />
        {/* Smoke */}
        <rect x="10" y="15" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
        <rect x="85" y="25" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
        <rect x="5" y="35" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
      </svg>
    ),
    color: 'from-gray-800 to-black'
  },
  {
    id: 'pixel_robot',
    name: 'Robot',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Head */}
        <rect x="30" y="20" width="40" height="25" fill="#6b7280" className="animate-pulse" />
        <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
        {/* Antenna */}
        <rect x="48" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="46" y="8" width="8" height="4" fill="#fbbf24" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
        <rect x="54" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
        <rect x="42" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
        <rect x="56" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
        {/* Mouth */}
        <rect x="45" y="38" width="10" height="3" fill="#ef4444" className="animate-pulse" />
        {/* Body */}
        <rect x="25" y="45" width="50" height="35" fill="#374151" className="animate-pulse" />
        {/* Chest panel */}
        <rect x="35" y="50" width="30" height="15" fill="#1f2937" className="animate-pulse" />
        <rect x="40" y="55" width="20" height="5" fill="#10b981" className="animate-pulse" />
        <rect x="42" y="57" width="16" height="1" fill="#1f2937" className="animate-pulse" />
        {/* Arms */}
        <rect x="15" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
        <rect x="73" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
        {/* Hands */}
        <rect x="10" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
        <rect x="82" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
        {/* Legs */}
        <rect x="35" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
        <rect x="53" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
        {/* Feet */}
        <rect x="32" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
        <rect x="50" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
      </svg>
    ),
    color: 'from-gray-500 to-gray-700'
  },
  {
    id: 'pixel_archer',
    name: 'Archer',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hat */}
        <rect x="40" y="15" width="20" height="15" fill="#7c2d12" className="animate-pulse" />
        <rect x="42" y="12" width="16" height="6" fill="#92400e" className="animate-pulse" />
        {/* Feather */}
        <rect x="55" y="10" width="8" height="12" fill="#dc2626" className="animate-pulse" />
        <rect x="57" y="8" width="4" height="16" fill="#ef4444" className="animate-pulse" />
        {/* Head */}
        <rect x="35" y="30" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
        <rect x="57" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
        {/* Beard */}
        <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
        {/* Body */}
        <rect x="30" y="53" width="40" height="25" fill="#059669" className="animate-pulse" />
        {/* Quiver */}
        <rect x="15" y="40" width="12" height="25" fill="#7c2d12" className="animate-pulse" />
        <rect x="17" y="42" width="8" height="21" fill="#92400e" className="animate-pulse" />
        {/* Arrows */}
        <rect x="18" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
        <rect x="21" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
        <rect x="24" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
        {/* Bow */}
        <rect x="75" y="30" width="4" height="40" fill="#7c2d12" className="animate-pulse" />
        <rect x="70" y="35" width="14" height="4" fill="#92400e" className="animate-pulse" />
        <rect x="72" y="33" width="10" height="8" fill="#7c2d12" className="animate-pulse" />
        {/* String */}
        <rect x="76" y="32" width="2" height="36" fill="#1f2937" className="animate-pulse" />
      </svg>
    ),
    color: 'from-green-600 to-emerald-700'
  },
  {
    id: 'pixel_mage',
    name: 'Mage',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hat */}
        <rect x="30" y="10" width="40" height="12" fill="#7c3aed" className="animate-pulse" />
        <rect x="25" y="18" width="50" height="8" fill="#6d28d9" className="animate-pulse" />
        <rect x="20" y="22" width="60" height="6" fill="#5b21b6" className="animate-pulse" />
        {/* Hat star */}
        <rect x="45" y="5" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
        <rect x="47" y="3" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
        <rect x="42" y="8" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
        {/* Head */}
        <rect x="35" y="28" width="30" height="22" fill="#fbbf24" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
        {/* Beard */}
        <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
        <rect x="30" y="47" width="40" height="4" fill="#4b5563" className="animate-pulse" />
        {/* Robe */}
        <rect x="25" y="50" width="50" height="35" fill="#3b82f6" className="animate-pulse" />
        {/* Staff */}
        <rect x="75" y="15" width="4" height="70" fill="#8b5cf6" className="animate-pulse" />
        <rect x="70" y="10" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
        <rect x="72" y="8" width="10" height="6" fill="#f59e0b" className="animate-pulse" />
        {/* Magic orb */}
        <rect x="68" y="25" width="8" height="8" fill="#10b981" className="animate-pulse" />
        <rect x="70" y="27" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Magic sparkles */}
        <rect x="15" y="20" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="85" y="30" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="10" y="40" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="90" y="50" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      </svg>
    ),
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'pixel_pirate',
    name: 'Pirate',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hat */}
        <rect x="25" y="15" width="50" height="12" fill="#1f2937" className="animate-pulse" />
        <rect x="20" y="20" width="60" height="8" fill="#374151" className="animate-pulse" />
        {/* Hat band */}
        <rect x="30" y="22" width="40" height="4" fill="#dc2626" className="animate-pulse" />
        {/* Skull */}
        <rect x="35" y="25" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
        {/* Eye patch */}
        <rect x="40" y="30" width="8" height="6" fill="#1f2937" className="animate-pulse" />
        <rect x="42" y="28" width="4" height="10" fill="#1f2937" className="animate-pulse" />
        {/* Good eye */}
        <rect x="52" y="32" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
        {/* Beard */}
        <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
        {/* Body */}
        <rect x="30" y="53" width="40" height="30" fill="#7c2d12" className="animate-pulse" />
        {/* Vest */}
        <rect x="35" y="58" width="30" height="20" fill="#92400e" className="animate-pulse" />
        {/* Buttons */}
        <rect x="45" y="65" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="45" y="70" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        <rect x="45" y="75" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
        {/* Hook */}
        <rect x="15" y="50" width="8" height="15" fill="#6b7280" className="animate-pulse" />
        <rect x="10" y="52" width="8" height="4" fill="#4b5563" className="animate-pulse" />
        {/* Sword */}
        <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
        <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
        {/* Treasure */}
        <rect x="5" y="70" width="8" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="6" y="72" width="6" height="4" fill="#f59e0b" className="animate-pulse" />
      </svg>
    ),
    color: 'from-red-600 to-orange-700'
  },
  {
    id: 'pixel_elf',
    name: 'Elf',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hat */}
        <rect x="35" y="10" width="30" height="15" fill="#059669" className="animate-pulse" />
        <rect x="30" y="20" width="40" height="8" fill="#047857" className="animate-pulse" />
        {/* Hat tip */}
        <rect x="48" y="5" width="4" height="8" fill="#dc2626" className="animate-pulse" />
        <rect x="46" y="3" width="8" height="4" fill="#ef4444" className="animate-pulse" />
        {/* Head */}
        <rect x="35" y="28" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
        {/* Ears */}
        <rect x="30" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
        <rect x="64" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
        {/* Smile */}
        <rect x="42" y="45" width="16" height="2" fill="#1f2937" className="animate-pulse" />
        {/* Body */}
        <rect x="30" y="48" width="40" height="35" fill="#059669" className="animate-pulse" />
        {/* Tunic */}
        <rect x="35" y="53" width="30" height="25" fill="#047857" className="animate-pulse" />
        {/* Belt */}
        <rect x="32" y="60" width="36" height="4" fill="#7c2d12" className="animate-pulse" />
        {/* Bow */}
        <rect x="75" y="25" width="4" height="35" fill="#7c2d12" className="animate-pulse" />
        <rect x="70" y="20" width="14" height="6" fill="#92400e" className="animate-pulse" />
        <rect x="72" y="18" width="10" height="4" fill="#7c2d12" className="animate-pulse" />
        {/* Arrow */}
        <rect x="76" y="15" width="2" height="25" fill="#6b7280" className="animate-pulse" />
        <rect x="75" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
        {/* Nature elements */}
        <rect x="10" y="30" width="4" height="4" fill="#10b981" className="animate-pulse" />
        <rect x="85" y="40" width="4" height="4" fill="#10b981" className="animate-pulse" />
        <rect x="5" y="50" width="4" height="4" fill="#10b981" className="animate-pulse" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'pixel_dwarf',
    name: 'Dwarf',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Helmet */}
        <rect x="30" y="20" width="40" height="15" fill="#6b7280" className="animate-pulse" />
        <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
        {/* Horns */}
        <rect x="25" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
        <rect x="69" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
        {/* Head */}
        <rect x="35" y="35" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
        {/* Eyes */}
        <rect x="40" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        <rect x="56" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
        {/* Nose */}
        <rect x="48" y="47" width="4" height="4" fill="#f59e0b" className="animate-pulse" />
        {/* Beard */}
        <rect x="32" y="50" width="36" height="12" fill="#6b7280" className="animate-pulse" />
        <rect x="30" y="52" width="40" height="8" fill="#4b5563" className="animate-pulse" />
        {/* Body */}
        <rect x="25" y="62" width="50" height="25" fill="#7c2d12" className="animate-pulse" />
        {/* Armor */}
        <rect x="30" y="67" width="40" height="15" fill="#92400e" className="animate-pulse" />
        {/* Axe */}
        <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
        <rect x="70" y="25" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
        <rect x="68" y="27" width="18" height="6" fill="#f59e0b" className="animate-pulse" />
        {/* Shield */}
        <rect x="15" y="50" width="12" height="20" fill="#dc2626" className="animate-pulse" />
        <rect x="17" y="52" width="8" height="16" fill="#ef4444" className="animate-pulse" />
        <rect x="19" y="55" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
        {/* Belt */}
        <rect x="30" y="75" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
        {/* Legs */}
        <rect x="35" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
        <rect x="53" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
      </svg>
    ),
    color: 'from-orange-600 to-red-700'
  },
  {
    id: 'pixel_samurai',
    name: 'Samurai',
    component: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Helmet */}
        <rect x="30" y="15" width="40" height="20" fill="#1f2937" className="animate-pulse" />
        <rect x="35" y="10" width="30" height="8" fill="#374151" className="animate-pulse" />
        {/* Helmet crest */}
        <rect x="45" y="5" width="10" height="8" fill="#dc2626" className="animate-pulse" />
        <rect x="47" y="3" width="6" height="12" fill="#ef4444" className="animate-pulse" />
        {/* Face mask */}
        <rect x="40" y="25" width="20" height="8" fill="#6b7280" className="animate-pulse" />
        <rect x="42" y="27" width="16" height="4" fill="#4b5563" className="animate-pulse" />
        {/* Eyes */}
        <rect x="45" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
        <rect x="52" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
        {/* Body */}
        <rect x="25" y="35" width="50" height="35" fill="#1f2937" className="animate-pulse" />
        {/* Armor plates */}
        <rect x="30" y="40" width="40" height="6" fill="#374151" className="animate-pulse" />
        <rect x="30" y="50" width="40" height="6" fill="#374151" className="animate-pulse" />
        <rect x="30" y="60" width="40" height="6" fill="#374151" className="animate-pulse" />
        {/* Katana */}
        <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
        <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
        {/* Wakizashi */}
        <rect x="15" y="40" width="3" height="30" fill="#6b7280" className="animate-pulse" />
        <rect x="10" y="35" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
        <rect x="12" y="33" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
        {/* Belt */}
        <rect x="30" y="65" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
        {/* Legs */}
        <rect x="35" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
        <rect x="53" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
        {/* Sandals */}
        <rect x="32" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
        <rect x="50" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
      </svg>
    ),
    color: 'from-gray-800 to-black'
  }
];

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentAvatarUrl
}) => {
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* CHANGED: Removed the padding (p-8) from here and used max-h-[90vh] */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800/50 w-full max-w-6xl **max-h-[90vh]** flex flex-col mx-4 shadow-2xl">
        
        {/* New Header Wrapper: Added p-8 for padding and mb-0 to control spacing */}
        <div className="flex items-center justify-between **p-8 pb-4**">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-white">Choose Your Character</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content Wrapper */}
        <div className="flex-1 **overflow-y-scroll** **px-8** **-mr-2**"> 
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-4">
            {ANIMATED_CHARACTERS.map((character) => (
              <div
                key={character.id}
                className="relative cursor-pointer group"
                onClick={() => onSelect(character.id)}
                onMouseEnter={() => setHoveredCharacter(character.id)}
                onMouseLeave={() => setHoveredCharacter(null)}
              >
                <div className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  currentAvatarUrl === character.id 
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/30' 
                    : 'border-slate-700 group-hover:border-slate-500'
                }`}>
                  <div className={`w-full h-full bg-gradient-to-br ${character.color} flex items-center justify-center ${
                    hoveredCharacter === character.id ? 'scale-110' : 'scale-100'
                  } transition-transform duration-300`}>
                    {character.component}
                  </div>
                  
                  {/* Selection indicator */}
                  {currentAvatarUrl === character.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  {hoveredCharacter === character.id && (
                    <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
                  )}
                </div>
                
                <p className="text-sm text-center mt-3 text-slate-300 font-medium group-hover:text-white transition-colors">
                  {character.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Wrapper: Added p-8 for padding and mb-0 to control spacing */}
        <div className="mt-8 flex justify-end border-t border-slate-800/50 **p-8 pt-6**">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};