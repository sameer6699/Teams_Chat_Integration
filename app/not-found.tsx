import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquareOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <MessageSquareOff className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <h2 className="mb-4 text-xl text-muted-foreground">Chat Not Found</h2>
      <p className="mb-8 text-center text-muted-foreground">
        The chat you are looking for does not exist or has been removed.
      </p>
      <Link href="/">
        <Button>Back to Chats</Button>
      </Link>
    </div>
  );
}
