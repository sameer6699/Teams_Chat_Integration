'use client';

import { Chat } from '@/lib/types';
import { UserAvatar } from './UserAvatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChatListProps {
  chats: Chat[];
}

export function ChatList({ chats }: ChatListProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Recent Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const isActive = pathname === `/chat/${chat.id}`;
          const participant = chat.participants?.[0];

          return (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-3 border-b p-4 transition-colors hover:bg-accent',
                  isActive && 'bg-accent'
                )}
              >
                <UserAvatar
                  user={participant}
                  name={chat.name}
                  avatar={chat.avatar}
                  showStatus
                />

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="ml-2 h-5 min-w-[20px] rounded-full bg-primary px-2"
                  >
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
