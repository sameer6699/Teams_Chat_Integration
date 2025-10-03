import { mockChats, mockMessages } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import ChatPageClient from './ChatPageClient';

export function generateStaticParams() {
  return mockChats.map((chat) => ({
    id: chat.id,
  }));
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const chatId = params.id;
  const chat = mockChats.find((c) => c.id === chatId);
  const messages = mockMessages[chatId] || [];

  if (!chat) {
    notFound();
  }

  return (
    <ChatPageClient
      chatId={chatId}
      chatName={chat.name}
      initialMessages={messages}
    />
  );
}
