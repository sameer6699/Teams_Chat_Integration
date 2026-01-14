'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

// Helper function to get initials from name or email
const getInitials = (name?: string, email?: string): string => {
  // First try to get initials from name
  if (name) {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first 2 characters
      return name.substring(0, 2).toUpperCase();
    }
    // Multiple words - take first letter of first two words
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
  }
  
  // If no name, try to get from email
  if (email) {
    // Extract username part before @
    const emailUsername = email.split('@')[0];
    if (emailUsername) {
      // If username has separators (e.g., "dev.apps", "dev_apps", "dev-apps"), take first letter of each part
      const emailWords = emailUsername.split(/[._-]/);
      if (emailWords.length > 1) {
        return (emailWords[0][0] + (emailWords[1]?.[0] || '')).toUpperCase();
      }
      
      // For compound words, try camelCase detection (e.g., "devApps" -> "DA")
      const camelCaseMatch = emailUsername.match(/^([a-z]+)([A-Z][a-z]+)/);
      if (camelCaseMatch) {
        return (camelCaseMatch[1][0] + camelCaseMatch[2][0]).toUpperCase();
      }
      
      // For words like "devapps", try intelligent splitting
      // Look for common patterns where a vowel is followed by consonants (potential word boundary)
      if (emailUsername.length >= 6) {
        // Try to find a split point that makes sense
        // Look for patterns like: consonant-vowel-consonant (potential word start)
        for (let i = 3; i < emailUsername.length - 2; i++) {
          const prevChar = emailUsername[i - 1];
          const char = emailUsername[i];
          // If we find a vowel followed by a consonant cluster, it might be a word start
          if (/[aeiou]/.test(prevChar) && /[bcdfghjklmnpqrstvwxyz]/.test(char)) {
            return (emailUsername[0] + char).toUpperCase();
          }
        }
      }
      
      // Single word - take first 2 characters
      return emailUsername.substring(0, 2).toUpperCase();
    }
  }
  
  // Fallback
  return 'U';
};

export function UserMenuDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get user initials
  const userInitials = getInitials(user?.name, user?.username || user?.email);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await logout();
      // Note: logout() now handles the redirect internally, so router.push is not needed
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium transition-all hover:ring-2 hover:ring-indigo-300 ${isDropdownOpen ? 'ring-2 ring-indigo-400' : ''}`}
        title={user.name || user.username || user.email || 'User menu'}
      >
        {userInitials}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-md">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.username || user.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Add profile navigation if needed
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <User className="w-4 h-4" />
              <div className="flex-1 text-left">
                <div className="font-medium">My Profile</div>
                <div className="text-xs text-gray-500">View and edit profile</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <div className="flex-1 text-left">
                <div className="font-medium">Settings</div>
                <div className="text-xs text-gray-500">Preferences and privacy</div>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-gray-200" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

