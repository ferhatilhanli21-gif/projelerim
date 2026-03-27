'use client';

import { Message } from '@/types';
import { formatTime } from '@/lib/duration';
import { FileText, Download, ShieldCheck } from 'lucide-react';

const GOLD_CSS = `
  @keyframes gold-pulse {
    0%,100% { box-shadow: 0 0 0 2px #facc15, 0 0 8px 2px rgba(250,204,21,.6); }
    50%      { box-shadow: 0 0 0 2px #f97316, 0 0 16px 5px rgba(249,115,22,.7); }
  }
  .avatar-admin { animation: gold-pulse 2s ease-in-out infinite; }
`;

interface Props {
  message: Message;
  isOwn: boolean;
}

function SenderAvatar({ name, avatarUrl, isAdmin, size = 8 }: {
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  size?: number;
}) {
  const dim = `w-${size} h-${size}`;
  const inner = avatarUrl ? (
    <img src={avatarUrl} alt={name} className={`${dim} rounded-full object-cover`} />
  ) : (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold text-sm select-none
      ${isAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );

  if (!isAdmin) return <div className="flex-shrink-0 mt-1">{inner}</div>;

  return (
    <div className="flex-shrink-0 mt-1 relative">
      <div className="avatar-admin rounded-full">{inner}</div>
      {/* crown badge */}
      <ShieldCheck className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-yellow-500 fill-yellow-400 drop-shadow" />
    </div>
  );
}

export function MessageBubble({ message, isOwn }: Props) {
  const sender = message.profiles;
  const isAdmin = sender?.role === 'admin';
  const name = sender?.full_name ?? '?';

  return (
    <>
      <style>{GOLD_CSS}</style>
      <div className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar — her zaman göster */}
        <SenderAvatar
          name={name}
          avatarUrl={sender?.avatar_url ?? null}
          isAdmin={isAdmin}
        />

        <div className={`max-w-[68%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* İsim + admin rozeti */}
          {!isOwn && sender && (
            <div className="flex items-center gap-1 px-1">
              <span className={`text-xs font-medium ${isAdmin ? 'text-yellow-700' : 'text-gray-500'}`}>
                {name}
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold border border-yellow-300">
                  Admin
                </span>
              )}
            </div>
          )}

          {/* Balon */}
          <div className={`rounded-2xl px-3 py-2 ${
            isOwn
              ? 'bg-red-600 text-white rounded-br-sm'
              : isAdmin
                ? 'rounded-bl-sm text-gray-800'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
            style={!isOwn && isAdmin ? {
              background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 60%, #fde68a 100%)',
              border: '1px solid #fcd34d',
            } : {}}
          >
            {message.file_url && message.file_type === 'image' && (
              <img
                src={message.file_url}
                alt={message.file_name ?? 'Görsel'}
                className="max-w-xs rounded-lg mb-1 cursor-pointer"
                onClick={() => window.open(message.file_url!, '_blank')}
              />
            )}
            {message.file_url && message.file_type === 'document' && (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm underline mb-1 ${isOwn ? 'text-white' : 'text-blue-600'}`}
              >
                <FileText className="h-4 w-4" />
                {message.file_name ?? 'Dosya'}
                <Download className="h-3 w-3" />
              </a>
            )}
            {message.body && <p className="text-sm whitespace-pre-wrap">{message.body}</p>}
          </div>

          <span className="text-[10px] text-gray-400 px-1">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    </>
  );
}
