'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  chatId: string;
  chatName: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, chatName, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      isSender: true,
    };

    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{chatName}</h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
