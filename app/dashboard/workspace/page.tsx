'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Settings, X, Cpu, Trash2, ToggleLeft, ToggleRight, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Sabitler ─── */
const PROVIDERS = [
  {
    id: 'openai',
    name: 'ChatGPT',
    color: '#10a37f',
    bg: '#f0fdf8',
    border: '#10a37f',
    logo: '🤖',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    storageKey: 'ws_openai_key',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    color: '#4285f4',
    bg: '#eff6ff',
    border: '#4285f4',
    logo: '✨',
    models: [
      { id: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
    ],
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIza...',
    storageKey: 'ws_gemini_key',
  },
  {
    id: 'anthropic',
    name: 'Claude',
    color: '#c96442',
    bg: '#fff7f4',
    border: '#c96442',
    logo: '🔮',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    ],
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    storageKey: 'ws_anthropic_key',
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]['id'];

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  provider?: string;
  model?: string;
  error?: boolean;
}

/* ─── Çalışma verisi sistem promptu ─── */
async function buildWorkContext(): Promise<string> {
  try {
    const [sessRes, histRes] = await Promise.all([
      fetch('/api/sessions/current'),
      fetch('/api/sessions/history?limit=5'),
    ]);
    const sess = await sessRes.json();
    const hist = await histRes.json();

    const lines: string[] = ['--- ÇALIŞAN BAĞLAM BİLGİSİ ---'];

    if (sess.session) {
      lines.push(`Aktif mesai: ${new Date(sess.session.clock_in).toLocaleTimeString('tr-TR')} saatinden beri devam ediyor.`);
    } else {
      lines.push('Şu an aktif mesai yok.');
    }

    if (hist.sessions?.length) {
      lines.push('Son oturumlar:');
      for (const s of hist.sessions.slice(0, 3)) {
        const d = s.duration_minutes ? `${Math.round(s.duration_minutes / 60 * 10) / 10} saat` : 'devam ediyor';
        lines.push(`  • ${new Date(s.clock_in).toLocaleDateString('tr-TR')}: ${d}`);
      }
    }

    lines.push('--- BAĞLAM SONU ---');
    return lines.join('\n');
  } catch {
    return '';
  }
}

/* ─── Ana sayfa ─── */
export default function WorkspacePage() {
  const [providerId, setProviderId] = useState<ProviderId>('openai');
  const [modelId, setModelId] = useState('gpt-4o');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [workContext, setWorkContext] = useState(true);
  const [pendingImage, setPendingImage] = useState<{ url: string; name: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const provider = PROVIDERS.find(p => p.id === providerId)!;

  // localStorage'dan API anahtarlarını yükle
  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (const p of PROVIDERS) {
      loaded[p.id] = localStorage.getItem(p.storageKey) ?? '';
    }
    setApiKeys(loaded);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Provider değişince ilk modeli seç
  useEffect(() => {
    setModelId(provider.models[0].id);
  }, [providerId]);

  const saveKey = (pid: string, val: string) => {
    const p = PROVIDERS.find(x => x.id === pid)!;
    localStorage.setItem(p.storageKey, val);
    setApiKeys(prev => ({ ...prev, [pid]: val }));
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'workspace');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (!data.url) return;
    if (file.type.startsWith('image/')) {
      setPendingImage({ url: data.url, name: file.name });
    } else {
      setPendingFile({ url: data.url, name: file.name });
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !pendingImage && !pendingFile) return;
    const key = apiKeys[providerId] ?? '';
    if (!key) { setShowSettings(true); return; }

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      imageUrl: pendingImage?.url,
      fileName: pendingFile?.name ?? pendingImage?.name,
      fileUrl: pendingFile?.url,
      fileType: pendingFile ? 'document' : pendingImage ? 'image' : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setPendingFile(null);
    setSending(true);

    // API için mesaj geçmişi formatla
    type ApiMsg = { role: 'user' | 'assistant'; content: string | { type: string; text?: string; image_url?: { url: string } }[] };
    const history: ApiMsg[] = messages.map(m => ({
      role: m.role,
      content: m.imageUrl
        ? [{ type: 'text', text: m.text || '' }, { type: 'image_url', image_url: { url: m.imageUrl } }]
        : m.text,
    }));

    const newContent: { type: string; text?: string; image_url?: { url: string } }[] = [];
    if (text) newContent.push({ type: 'text', text });
    if (userMsg.imageUrl) newContent.push({ type: 'image_url', image_url: { url: userMsg.imageUrl } });

    history.push({ role: 'user', content: newContent.length > 1 ? newContent : (text || '') });

    let systemPrompt = `Sen Sor Ajans çalışma asistanısın. Çalışanların sorularına yardımcı oluyorsun. Yanıtların Türkçe olsun, profesyonel ve nazik bir ton kullan.`;
    if (workContext) {
      const ctx = await buildWorkContext();
      if (ctx) systemPrompt += '\n\n' + ctx;
    }

    try {
      const res = await fetch('/api/workspace/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, model: modelId, apiKey: key, messages: history, systemPrompt }),
      });
      const data = await res.json();

      const aiMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.reply ?? data.error ?? 'Yanıt alınamadı',
        provider: providerId,
        model: modelId,
        error: !!data.error,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: 'Bağlantı hatası', error: true, provider: providerId, model: modelId }]);
    }
    setSending(false);
  }, [input, pendingImage, pendingFile, apiKeys, providerId, modelId, messages, workContext]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentKey = apiKeys[providerId] ?? '';
  const hasKey = !!currentKey;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -mt-6 -mx-4">

      {/* ── Üst çubuk ── */}
      <div className="bg-white border-b px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <Cpu className="h-5 w-5 text-gray-500" />
        <span className="font-semibold text-gray-800 text-sm">Çalışma Alanı</span>
        <div className="h-4 w-px bg-gray-200" />

        {/* Provider seçici */}
        <div className="flex gap-1">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id as ProviderId)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={providerId === p.id
                ? { background: p.color, color: '#fff' }
                : { background: '#f3f4f6', color: '#374151' }}
            >
              <span>{p.logo}</span>
              {p.name}
            </button>
          ))}
        </div>

        {/* Model seçici */}
        <select
          value={modelId}
          onChange={e => setModelId(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400 bg-white"
        >
          {provider.models.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Çalışma bağlamı toggle */}
        <button
          onClick={() => setWorkContext(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${workContext ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
          title="Mesai verilerini AI bağlamına ekle"
        >
          {workContext ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          İş Bağlamı
        </button>

        <button onClick={() => setMessages([])} title="Sohbeti temizle" className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
        <button onClick={() => setShowSettings(s => !s)} className={`transition-colors ${showSettings ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* ── Ayarlar paneli ── */}
      {showSettings && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex-shrink-0">
          <p className="text-xs font-semibold text-yellow-800 mb-2">API Anahtarları <span className="font-normal text-yellow-600">(tarayıcında saklanır)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROVIDERS.map(p => (
              <div key={p.id}>
                <label className="text-xs text-gray-600 mb-0.5 block">{p.logo} {p.keyLabel}</label>
                <input
                  type="password"
                  placeholder={p.keyPlaceholder}
                  value={apiKeys[p.id] ?? ''}
                  onChange={e => saveKey(p.id, e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-yellow-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mesajlar alanı ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-5xl">{provider.logo}</div>
            <div>
              <p className="font-semibold text-gray-700">{provider.name} ile sohbet et</p>
              <p className="text-sm text-gray-400 mt-1">Sorularını yaz, dosya veya görsel ekle</p>
              {!hasKey && (
                <button onClick={() => setShowSettings(true)} className="mt-3 text-xs text-red-600 underline">
                  ⚙ API anahtarı ekle
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-sm w-full mt-2">
              {['Bugün neler yaptım?', 'Çalışma raporumu özetle', 'Yarın için plan yap', 'Nasıl daha verimli olabilirim?'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-gray-400 hover:shadow-sm transition-all text-gray-600">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
              style={m.role === 'user'
                ? { background: '#fee2e2', color: '#dc2626' }
                : { background: PROVIDERS.find(p => p.id === m.provider)?.color ?? '#6366f1', color: '#fff' }}>
              {m.role === 'user' ? 'S' : PROVIDERS.find(p => p.id === m.provider)?.logo ?? '🤖'}
            </div>

            <div className={`max-w-[72%] flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {m.role === 'assistant' && (
                <span className="text-[10px] text-gray-400 px-1">
                  {PROVIDERS.find(p => p.id === m.provider)?.name} · {m.model}
                </span>
              )}

              <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-sm'
                  : m.error
                    ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
              }`}>
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="görsel" className="max-w-xs rounded-lg mb-2 cursor-pointer" onClick={() => window.open(m.imageUrl!, '_blank')} />
                )}
                {m.fileUrl && (
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-xs mb-2 underline ${m.role === 'user' ? 'text-white/80' : 'text-blue-600'}`}>
                    <FileText className="h-3.5 w-3.5" />
                    {m.fileName}
                    <Download className="h-3 w-3" />
                  </a>
                )}
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: provider.color, color: '#fff' }}>
              {provider.logo}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Bekleyen dosya/görsel önizleme ── */}
      {(pendingImage || pendingFile) && (
        <div className="bg-white border-t px-4 py-2 flex items-center gap-2 flex-shrink-0">
          {pendingImage && (
            <div className="relative">
              <img src={pendingImage.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {pendingFile && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 relative pr-8">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-700 max-w-[200px] truncate">{pendingFile.name}</span>
              <button onClick={() => setPendingFile(null)} className="absolute right-1 text-gray-400 hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Input alanı ── */}
      <div className="bg-white border-t px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <input ref={fileRef} type="file" className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }}
          />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors mb-0.5">
            <Paperclip className={`h-5 w-5 ${uploading ? 'animate-spin' : ''}`} />
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={hasKey ? `${provider.name}'e mesaj yaz... (Enter ile gönder)` : 'Önce API anahtarı ekle →'}
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />

          <Button onClick={handleSend} disabled={sending || (!input.trim() && !pendingImage && !pendingFile)}
            className="flex-shrink-0 mb-0.5"
            style={{ background: provider.color }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">
          AI yanıtları hata içerebilir. Önemli kararlar için doğrulayın.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity: .4; }
          50%      { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
