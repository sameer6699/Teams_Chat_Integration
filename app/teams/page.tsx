'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/UserAvatar';
import { mockUsers } from '@/lib/mock-data';
import { Users } from 'lucide-react';

export default function TeamsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-muted-foreground">View and manage your teams</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Marketing Team
                </CardTitle>
                <CardDescription>6 members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <UserAvatar user={user} showStatus />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Development Team
                </CardTitle>
                <CardDescription>4 members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {mockUsers.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <UserAvatar user={user} showStatus />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
