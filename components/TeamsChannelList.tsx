'use client';

import { Search, Plus, Filter, ChevronDown, Hash, Lock, Bell } from 'lucide-react';
import { useState } from 'react';
import { Project, Notification } from '@/lib/types';
import { useAuth } from '@/lib/authContext';

interface TeamsChannelListProps {
  projects: Project[];
  notifications: Notification[];
  selectedProject: string;
  onProjectSelect: (projectId: string) => void;
}

export function TeamsChannelList({
  projects,
  notifications,
  selectedProject,
  onProjectSelect,
}: TeamsChannelListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'archived'>('all');
  const { user } = useAuth();

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-rose-500',
      'from-red-400 to-pink-500',
    ];
    const index = parseInt(id, 10) % colors.length;
    return colors[index];
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterTab === 'all' || 
      (filterTab === 'active' && project.tag === 'Active') ||
      (filterTab === 'archived' && project.tag === 'Archived');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 bg-[#f5f5f5] border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-300 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Teams Chat Integration</h2>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {user.name?.substring(0, 2).toUpperCase() || 'DA'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Welcome, {user.name || 'User'}!
                </p>
                <p className="text-xs text-indigo-600 truncate">
                  {user.username || user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
            <div className="text-xs font-medium text-blue-700">Projects</div>
            <div className="text-2xl font-bold text-blue-900">{projects.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
            <div className="text-xs font-medium text-green-700">Messages</div>
            <div className="text-2xl font-bold text-green-900">4</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-2">
          {(['all', 'active', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`
                flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors
                ${filterTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="p-2 bg-white border-b border-gray-300">
          <div className="text-xs font-semibold text-gray-700 mb-1 px-2">Notifications</div>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Bell className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs text-gray-700 flex-1">{notif.text}</span>
              {notif.unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {notif.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects/Channels List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-1">
              <ChevronDown className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Projects</span>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
              <Plus className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {filteredProjects.map((project) => {
              const isSelected = project.id === selectedProject;
              return (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project.id)}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-all
                    ${isSelected 
                      ? 'bg-white shadow-sm border border-indigo-200' 
                      : 'hover:bg-white/50'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarColor(project.id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                    {getInitials(project.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {project.name}
                      </span>
                      {project.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                          {project.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      <span className="font-medium">Status:</span> {project.status}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {project.client && <span>Client: {project.client}</span>}
                      {project.owner && <span>Owner: {project.owner}</span>}
                      {project.team && <span>Team: {project.team}</span>}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {project.detail}
                    </div>
                  </div>

                  {/* Tag Badge */}
                  <div className={`
                    px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                    ${project.tag === 'Active' ? 'bg-green-100 text-green-700' : ''}
                    ${project.tag === 'Review' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${project.tag === 'Planning' ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {project.tag}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

