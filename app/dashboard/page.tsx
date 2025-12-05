'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { TeamsNavRail } from '@/components/TeamsNavRail';
import { TeamsChannelList } from '@/components/TeamsChannelList';
import { TeamsHeader } from '@/components/TeamsHeader';
import { TeamsChatArea } from '@/components/TeamsChatArea';
import { mockProjects, mockNotifications, mockMessages, mockUsers } from '@/lib/mock-data';

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState('1');
  
  const currentProject = mockProjects.find(p => p.id === selectedProject);
  const currentMessages = mockMessages[selectedProject] || [];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
        {/* Teams-style Navigation Rail */}
        <TeamsNavRail />

        {/* Teams-style Channel/Project List */}
        <TeamsChannelList
          projects={mockProjects}
          notifications={mockNotifications}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Teams-style Header */}
          <TeamsHeader
            channelName={currentProject?.name || 'Select a project'}
            membersCount={4}
          />

          {/* Teams-style Chat Area */}
          <TeamsChatArea
            messages={currentMessages}
            users={mockUsers}
          />
        </div>
      </div>
    </AuthGuard>
  );
}

