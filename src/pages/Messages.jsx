import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Send, ArrowLeft, MoreVertical, User, Image,
  Phone, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('Messages'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Messages'));
      }
    };
    checkAuth();
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['my-messages', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 100);
      const received = await base44.entities.Message.filter({ receiver_email: user.email }, '-created_date', 100);
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!user?.email,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
      setNewMessage('');
    },
  });

  // Group messages by thread
  const threads = messages.reduce((acc, msg) => {
    const threadId = msg.thread_id;
    if (!acc[threadId]) {
      acc[threadId] = {
        id: threadId,
        messages: [],
        otherPerson: msg.sender_email === user?.email ? msg.receiver_name : msg.sender_name,
        otherEmail: msg.sender_email === user?.email ? msg.receiver_email : msg.sender_email,
        listing: msg.listing_title,
        lastMessage: msg,
      };
    }
    acc[threadId].messages.push(msg);
    return acc;
  }, {});

  const threadList = Object.values(threads).sort((a, b) => 
    new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
  );

  const filteredThreads = threadList.filter(thread =>
    thread.otherPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.listing?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThread = selectedThread ? threads[selectedThread] : null;

  const handleSend = () => {
    if (!newMessage.trim() || !currentThread) return;

    sendMutation.mutate({
      thread_id: selectedThread,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: currentThread.otherEmail,
      receiver_name: currentThread.otherPerson,
      listing_id: currentThread.messages[0]?.listing_id,
      listing_title: currentThread.listing,
      content: newMessage,
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex pb-16 lg:pb-0">
      {/* Thread List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r flex-shrink-0 flex flex-col ${
        selectedThread ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-32 mt-2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`w-full p-4 flex items-start gap-4 hover:bg-orange-50/50 transition-all border-b border-gray-50 relative group ${
                  selectedThread === thread.id ? 'bg-orange-50 border-r-4 border-r-[#F47524]' : 'border-r-4 border-r-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-orange-200 transition-colors">
                    <User className="h-6 w-6 text-gray-400 group-hover:text-orange-400" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate transition-colors ${selectedThread === thread.id ? 'text-[#F47524]' : 'text-gray-900'}`}>
                      {thread.otherPerson || 'User'}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {thread.lastMessage.created_date && 
                        formatDistanceToNow(new Date(thread.lastMessage.created_date), { addSuffix: false }).replace('about ', '')}
                    </span>
                  </div>
                  {thread.listing && (
                    <p className="text-xs text-orange-600/80 font-medium truncate mb-0.5">{thread.listing}</p>
                  )}
                  <p className="text-sm text-gray-500 truncate leading-snug group-hover:text-gray-700">
                    {thread.lastMessage.content}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
        {currentThread ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm z-10">
              <button
                onClick={() => setSelectedThread(null)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-50 rounded-full"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
                <User className="h-5 w-5 text-[#F47524]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {currentThread.otherPerson || 'User'}
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 h-5">Online</Badge>
                </h2>
                {currentThread.listing && (
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    Regarding: <span className="font-medium text-orange-600">{currentThread.listing}</span>
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-orange-50 hover:text-[#F47524]">
                <Phone className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentThread.messages
                .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                .map((msg) => {
                  const isOwn = msg.sender_email === user.email;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                        isOwn 
                          ? 'bg-gradient-to-br from-[#F47524] to-[#ff8f4d] text-white rounded-br-sm' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 flex items-center justify-end ${isOwn ? 'text-white/80' : 'text-gray-400'}`}>
                          {msg.created_date && 
                            formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 transition-all flex items-end gap-2 shadow-inner">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-600 rounded-xl mb-0.5">
                  <Image className="h-5 w-5" />
                </Button>
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-[44px] max-h-32 resize-none border-none bg-transparent focus-visible:ring-0 px-2 py-3 text-gray-700 placeholder:text-gray-400"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  className="bg-[#F47524] hover:bg-[#E06418] h-10 w-10 rounded-xl shadow-lg shadow-orange-500/20 mb-0.5 transition-all hover:scale-105 active:scale-95"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}