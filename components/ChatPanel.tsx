'use client';

import { Project, Message, User } from '@/lib/types';
import { Smile, Paperclip, Send } from 'lucide-react';

interface ChatPanelProps {
  project: Project | undefined;
  messages: Message[];
  users: User[];
}

export function ChatPanel({ project, messages, users }: ChatPanelProps) {
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getOnlineUsers = () => {
    return users.slice(0, 4); // Show first 4 users as online
  };

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a project to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">#{project.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">4 online</span>
            </div>
          </div>
          <div className="flex -space-x-2">
            {getOnlineUsers().map((user, index) => (
              <div
                key={user.id}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                style={{ zIndex: 4 - index }}
              >
                {getAvatarInitials(user.name)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Today separator */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Today</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-xs lg:max-w-md ${message.isSender ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {!message.isSender && message.sender && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3 flex-shrink-0">
                  {getAvatarInitials(message.sender.name)}
                </div>
              )}
              
              <div className={`${message.isSender ? 'ml-3' : 'mr-3'}`}>
                {/* Name and timestamp */}
                <div className={`flex items-center space-x-2 mb-1 ${message.isSender ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-sm font-medium text-gray-900">
                    {message.isSender ? 'You' : message.sender?.name}
                  </span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                
                {/* Message bubble */}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.isSender
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
              
              {/* Avatar for sender messages */}
              {message.isSender && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold ml-3 flex-shrink-0">
                  {getAvatarInitials('You')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message ${project.name}`}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
