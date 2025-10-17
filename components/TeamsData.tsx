'use client';

import { useGraphApi } from '@/hooks/useGraphApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, MessageSquare, AlertCircle } from 'lucide-react';

export const TeamsData: React.FC = () => {
  const { user, chats, teams, loading, error, fetchChats, fetchTeams } = useGraphApi();

  return (
    <div className="space-y-6">
      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.displayName}</p>
              <p><strong>Email:</strong> {user.mail || user.userPrincipalName}</p>
              {user.jobTitle && <p><strong>Job Title:</strong> {user.jobTitle}</p>}
              {user.officeLocation && <p><strong>Office:</strong> {user.officeLocation}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teams ({teams.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTeams}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Microsoft Teams you're a member of
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-muted-foreground">No teams found</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{team.displayName}</h4>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {team.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {new Date(team.createdDateTime).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chats ({chats.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchChats}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Your Teams chat conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chats.length === 0 ? (
              <p className="text-muted-foreground">No chats found</p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div key={chat.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">
                      {chat.topic || `${chat.chatType} Chat`}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {chat.chatType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.lastUpdatedDateTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
