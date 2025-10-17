'use client';

import { useState } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { UserProfile } from '../components/UserProfile';
import { ProjectsPanel } from '../components/ProjectsPanel';
import { ChatPanel } from '../components/ChatPanel';
import { EnvDebug } from '../components/EnvDebug';
import { mockProjects, mockNotifications, mockMessages, mockUsers } from '../lib/mock-data';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState('1');

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white text-gray-900">
        {/* Left Panel - Projects */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Teams Chat Integration</h1>
            <UserProfile />
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
