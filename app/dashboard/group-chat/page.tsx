'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/types';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? ''));
  }, []);

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/group-chat?limit=100');
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('group-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=is.null' }, () => {
        loadMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadMessages]);

  async function handleSend(body: string, fileUrl?: string, fileName?: string, fileType?: string) {
    await fetch('/api/group-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, file_url: fileUrl, file_name: fileName, file_type: fileType }),
    });
    loadMessages();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -mt-6 -mx-4 bg-gray-50">
      <div className="bg-white border-b px-4 py-3">
        <h1 className="font-semibold text-gray-800">💬 Genel Sohbet</h1>
        <p className="text-xs text-gray-400">Tüm ekip burada</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? <LoadingSpinner /> : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Henüz mesaj yok. İlk mesajı sen at!</p>
        ) : messages.map(m => (
          <MessageBubble key={m.id} message={m} isOwn={m.sender_id === myId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} placeholder="Herkese mesaj yaz..." folder="group" />
    </div>
  );
}
