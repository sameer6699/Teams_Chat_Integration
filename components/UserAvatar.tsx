import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/types';

interface UserAvatarProps {
  user?: User;
  name?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function UserAvatar({ user, name, avatar, size = 'md', showStatus = false }: UserAvatarProps) {
  const displayName = user?.name || name || 'User';
  const displayAvatar = user?.avatar || avatar;
  const status = user?.status;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  };

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background ${statusColors[status]}`}
        />
      )}
    </div>
  );
}
