'use client';

import { useState } from 'react';
import { Send, Smile, Paperclip, AtSign, Bold, Italic, Underline, MoreHorizontal } from 'lucide-react';
import { Message, User } from '@/lib/types';

interface TeamsChatAreaProps {
  messages: Message[];
  users: User[];
}

export function TeamsChatArea({ messages, users }: TeamsChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic here
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-rose-500',
      'from-red-400 to-pink-500',
    ];
    const index = parseInt(id, 10) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Messages */}
        {messages.map((message) => {
          const sender = message.sender || users[0];
          const initials = sender.name.substring(0, 1).toUpperCase();

          return (
            <div key={message.id} className="flex gap-3 group hover:bg-gray-50 -mx-4 px-4 py-1 rounded transition-colors">
              {/* Avatar */}
              {!message.isSender && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(sender.id)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                  {initials}
                </div>
              )}
              
              {message.isSender && <div className="w-8" />}

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {message.isSender ? 'You' : sender.name}
                  </span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  {message.text}
                </div>

                {/* Message Actions (visible on hover) */}
                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs text-indigo-600 hover:underline">Reply</button>
                  <span className="text-xs text-gray-300">•</span>
                  <button className="text-xs text-gray-500 hover:text-gray-700">React</button>
                </div>
              </div>

              {/* More Options */}
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Message Compose Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bold">
              <Bold className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Italic">
              <Italic className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Underline">
              <Underline className="w-4 h-4 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Attach file">
              <Paperclip className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Mention">
              <AtSign className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Emoji">
              <Smile className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex items-end gap-2 p-3 bg-white">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`
                p-2 rounded transition-colors flex-shrink-0
                ${newMessage.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

