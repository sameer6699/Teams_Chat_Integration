import { Message } from '@/lib/types';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        message.isSender ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!message.isSender && message.sender && (
        <UserAvatar user={message.sender} size="sm" />
      )}

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%]',
          message.isSender ? 'items-end' : 'items-start'
        )}
      >
        {!message.isSender && message.sender && (
          <span className="text-xs font-medium text-muted-foreground px-3">
            {message.sender.name}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            message.isSender
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <p className="text-sm">{message.text}</p>
        </div>

        <span className="text-xs text-muted-foreground px-3">
          {message.timestamp}
        </span>
      </div>

      {message.isSender && (
        <div className="w-8" />
      )}
    </div>
  );
}
