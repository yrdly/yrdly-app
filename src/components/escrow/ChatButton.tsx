"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { ChatService } from '@/lib/chat-service';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send } from 'lucide-react';

interface ChatButtonProps {
  itemId: string;
  itemTitle: string;
  itemImageUrl: string;
  sellerId: string;
  sellerName: string;
}

export function ChatButton({ itemId, itemTitle, itemImageUrl, sellerId, sellerName }: ChatButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const handleOpenChat = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to chat with sellers",
        variant: "destructive",
      });
      return;
    }

    if (user.uid === sellerId) {
      toast({
        title: "Error",
        description: "You cannot chat with yourself",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get or create chat
      const newChatId = await ChatService.getOrCreateChat(
        itemId,
        user.uid,
        sellerId,
        itemTitle,
        itemImageUrl
      );

      setChatId(newChatId);

      // Load existing messages
      const existingMessages = await ChatService.getChatMessages(newChatId);
      setMessages(existingMessages);

      setIsOpen(true);
    } catch (error) {
      console.error('Failed to open chat:', error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !user) return;

    const messageText = message.trim();
    setMessage('');

    try {
      // Add message to local state immediately for better UX
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        content: messageText,
        timestamp: new Date(),
        isRead: false,
        messageType: 'text' as const
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send message to server
      await ChatService.sendMessage(
        chatId,
        user.uid,
        user.displayName || 'Unknown',
        messageText,
        'text',
        undefined // No metadata for regular text messages
      );

      // Remove temp message and refresh
      const updatedMessages = await ChatService.getChatMessages(chatId);
      setMessages(updatedMessages);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-gray-300 hover:bg-gray-50"
          onClick={handleOpenChat}
          disabled={isLoading}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isLoading ? 'Opening...' : 'Chat with Seller'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-semibold">Chat about {itemTitle}</div>
              <div className="text-sm text-gray-600">with {sellerName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === user?.uid
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {msg.senderId === user?.uid ? 'You' : msg.senderName}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      msg.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="mt-4 flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
