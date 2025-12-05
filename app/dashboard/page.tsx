'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { UserProfile } from '@/components/UserProfile';
import { ProjectsPanel } from '@/components/ProjectsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { EnvDebug } from '@/components/EnvDebug';
import { mockProjects, mockNotifications, mockMessages, mockUsers } from '@/lib/mock-data';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, FolderKanban, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState('1');
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white text-gray-900">
        {/* Left Panel - Projects */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-semibold">Teams Chat Integration</h1>
              <UserProfile />
            </div>
            
            {/* Welcome Message */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Welcome, {user.name || user.username}!</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {user.username}
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Projects</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockProjects.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">Messages</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Object.values(mockMessages).reduce((acc, msgs) => acc + msgs.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <ProjectsPanel 
            projects={mockProjects}
            notifications={mockNotifications}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        </div>
        
        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatPanel 
            project={mockProjects.find(p => p.id === selectedProject)}
            messages={mockMessages[selectedProject] || []}
            users={mockUsers}
          />
        </div>
      </div>
      <EnvDebug />
    </AuthGuard>
  );
}

