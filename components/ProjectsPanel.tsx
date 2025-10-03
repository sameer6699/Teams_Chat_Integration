'use client';

import { Project, Notification } from '@/lib/types';
import { Search, Plus } from 'lucide-react';

interface ProjectsPanelProps {
  projects: Project[];
  notifications: Notification[];
  selectedProject: string;
  onProjectSelect: (projectId: string) => void;
}

export function ProjectsPanel({ 
  projects, 
  notifications, 
  selectedProject, 
  onProjectSelect 
}: ProjectsPanelProps) {
  const getProjectInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Active':
        return 'bg-blue-500 text-white';
      case 'Review':
        return 'bg-gray-500 text-white';
      case 'Planning':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-base font-semibold text-gray-900">Projects</h2>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-1">
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          <button className="px-3 py-1.5 text-xs rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">All</button>
          <button className="px-3 py-1.5 text-xs rounded-md bg-blue-500 text-white shadow-sm">Active</button>
          <button className="px-3 py-1.5 text-xs rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">Archived</button>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
              selectedProject === project.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-2">
              {/* Avatar */}
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {getProjectInitials(project.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{project.name}</h3>
                  {project.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-2 text-xs">
                      {project.unreadCount}
                    </div>
                  )}
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600">Status: {project.status}</p>
                  {project.client && <p className="text-xs text-gray-600">Client: {project.client}</p>}
                  {project.owner && <p className="text-xs text-gray-600">Owner: {project.owner}</p>}
                  {project.team && <p className="text-xs text-gray-600">Team: {project.team}</p>}
                  {project.eta && <p className="text-xs text-gray-600">ETA: {project.eta}</p>}
                  <p className="text-xs text-gray-600">{project.detail}</p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-1.5 py-0.5 text-xs rounded ${getTagColor(project.tag)}`}>
                    {project.tag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications Section */}
      <div className="border-t border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Notifications</h3>
        <div className="space-y-1">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded cursor-pointer">
              <span className="text-xs text-gray-700">{notification.text}</span>
              {notification.unreadCount > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {notification.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
