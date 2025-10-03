'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <Button type="button" variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none border-0 focus-visible:ring-0"
            rows={1}
          />
        </div>

        <Button type="button" variant="ghost" size="icon" className="shrink-0">
          <Smile className="h-5 w-5" />
        </Button>

        <Button
          type="submit"
          size="icon"
          className="shrink-0"
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
