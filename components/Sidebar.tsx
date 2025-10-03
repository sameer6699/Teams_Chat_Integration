'use client';

import { MessageSquare, Users, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Chats',
      icon: MessageSquare,
      href: '/',
      active: pathname === '/' || pathname?.startsWith('/chat'),
    },
    {
      title: 'Teams',
      icon: Users,
      href: '/teams',
      active: pathname === '/teams',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 ease-in-out md:sticky md:top-16 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4 md:hidden">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant={item.active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      item.active && 'bg-accent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Teams Chat Integration v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
