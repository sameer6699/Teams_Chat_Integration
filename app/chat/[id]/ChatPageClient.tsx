'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { Message } from '@/lib/types';

interface ChatPageClientProps {
  chatId: string;
  chatName: string;
  initialMessages: Message[];
}

export default function ChatPageClient({ chatId, chatName, initialMessages }: ChatPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-hidden">
          <ChatWindow
            chatId={chatId}
            chatName={chatName}
            initialMessages={initialMessages}
          />
        </main>
      </div>
    </div>
  );
}
