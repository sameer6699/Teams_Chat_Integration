'use client';

import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Phone, 
  FileText, 
  MoreHorizontal,
  Grid3x3,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'activity', icon: Grid3x3, label: 'Activity' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'teams', icon: Users, label: 'Teams' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'calls', icon: Phone, label: 'Calls' },
  { id: 'files', icon: FileText, label: 'Files' },
];

export function TeamsNavRail() {
  const [activeNav, setActiveNav] = useState('teams');

  return (
    <div className="w-16 bg-[#464775] flex flex-col items-center py-2 border-r border-gray-700">
      {/* Logo/Brand */}
      <div className="mb-6 mt-2">
        <div className="w-10 h-10 bg-[#6264a7] rounded flex items-center justify-center text-white font-bold text-sm">
          TC
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`
                w-12 h-12 rounded flex flex-col items-center justify-center
                transition-colors relative group
                ${isActive 
                  ? 'bg-[#6264a7] text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <button 
          className="w-12 h-12 rounded flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="More"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        <button 
          className="w-12 h-12 rounded flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

