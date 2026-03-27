'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (body: string, fileUrl?: string, fileName?: string, fileType?: string) => Promise<void>;
  placeholder?: string;
  folder?: string;
}

export function MessageInput({ onSend, placeholder = 'Mesaj yaz...', folder = 'group' }: MessageInputProps) {
  const [body, setBody] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Dosya 10MB\'dan büyük olamaz'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setPreview({ url: data.url, name: data.name, type: data.type });
    } else {
      toast.error(data.error ?? 'Yükleme başarısız');
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleSend() {
    if (!body.trim() && !preview) return;
    setSending(true);
    await onSend(body.trim(), preview?.url, preview?.name, preview?.type);
    setBody('');
    setPreview(null);
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t bg-white p-3 space-y-2">
      {preview && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
          {preview.type === 'image' ? (
            <img src={preview.url} alt={preview.name} className="h-10 w-10 object-cover rounded" />
          ) : (
            <span className="text-blue-600">📄 {preview.name}</span>
          )}
          <button onClick={() => setPreview(null)} className="ml-auto text-gray-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? 'Yükleniyor...' : placeholder}
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 max-h-32"
        />
        <Button
          onClick={handleSend}
          disabled={sending || uploading || (!body.trim() && !preview)}
          className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0 h-9 w-9 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
