'use client';

import { Search, Settings, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import { currentUser } from '@/lib/mock-data';
import Link from 'next/link';

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          <h1 className="text-xl font-bold">Teams Chat</h1>
        </div>

        <div className="flex flex-1 items-center gap-4 md:ml-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="w-full pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <UserAvatar user={currentUser} showStatus />
        </div>
      </div>
    </header>
  );
}
