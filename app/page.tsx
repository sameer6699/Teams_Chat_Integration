'use client';

import { useState } from 'react';
import { ProjectsPanel } from '../components/ProjectsPanel';
import { ChatPanel } from '../components/ChatPanel';
import { mockProjects, mockNotifications, mockMessages, mockUsers } from '../lib/mock-data';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState('1');

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Left Panel - Projects */}
      <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
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
  );
}
