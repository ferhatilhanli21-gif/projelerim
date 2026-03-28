'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message, Profile } from '@/types';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

export default function MessagesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const onlineIds = useOnlineUsers();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? ''));
    // Tüm kullanıcıları getir (admin dahil)
    fetch('/api/users').then(r => r.json()).then(d => setProfiles(d.users ?? []));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/messages?with=${selected.id}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [selected]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Broadcast: konuşmaya özel kanal
  useEffect(() => {
    if (!selected || !myId) return;
    const supabase = createClient();
    const channelName = `dm-${[myId, selected.id].sort().join('-')}`;
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'new_dm' }, () => loadMessages())
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [selected, myId, loadMessages]);

  async function handleSend(body: string, fileUrl?: string, fileName?: string, fileType?: string) {
    if (!selected) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: selected.id, body, file_url: fileUrl, file_name: fileName, file_type: fileType }),
    });
    if (res.ok) {
      await loadMessages();
      channelRef.current?.send({ type: 'broadcast', event: 'new_dm', payload: {} });
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -mt-6 -mx-4">
      {/* Sol: kişi listesi */}
      <div className="w-64 border-r bg-white flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Mesajlar</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {profiles.filter(p => p.id !== myId).map(p => {
            const isOnline = onlineIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selected?.id === p.id ? 'bg-red-50 border-r-2 border-red-600' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                    {p.full_name.charAt(0)}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {isOnline ? (
                      <span className="text-green-600 font-medium">Çevrimiçi</span>
                    ) : (
                      p.role === 'admin' ? 'Admin' : 'Çalışan'
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ: mesaj ekranı */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Mesajlaşmak için bir kişi seç
          </div>
        ) : (
          <>
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                  {selected.full_name.charAt(0)}
                </div>
                {onlineIds.has(selected.id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-800">{selected.full_name}</span>
                {onlineIds.has(selected.id) && (
                  <p className="text-xs text-green-600">Çevrimiçi</p>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? <LoadingSpinner /> : messages.map(m => (
                <MessageBubble key={m.id} message={m} isOwn={m.sender_id === myId} />
              ))}
              <div ref={bottomRef} />
            </div>
            <MessageInput onSend={handleSend} placeholder={`${selected.full_name}'e mesaj yaz...`} folder="dm" />
          </>
        )}
      </div>
    </div>
  );
}
