import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type MessagePart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };
type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string | MessagePart[] };

async function toBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const mime = res.headers.get('content-type') ?? 'image/jpeg';
  return { data: Buffer.from(buf).toString('base64'), mimeType: mime };
}

async function callOpenAI(apiKey: string, model: string, messages: ChatMessage[]) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'OpenAI hatası');
  return data.choices[0].message.content as string;
}

async function callGemini(apiKey: string, model: string, messages: ChatMessage[], systemPrompt: string) {
  const contents = await Promise.all(
    messages
      .filter(m => m.role !== 'system')
      .map(async m => {
        if (typeof m.content === 'string') {
          return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
        }
        const parts = await Promise.all(
          (m.content as MessagePart[]).map(async p => {
            if (p.type === 'text') return { text: p.text };
            const { data, mimeType } = await toBase64(p.image_url.url);
            return { inlineData: { mimeType, data } };
          })
        );
        return { role: 'user', parts };
      })
  );

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Gemini hatası');
  return data.candidates?.[0]?.content?.parts?.[0]?.text as string ?? '';
}

async function callAnthropic(apiKey: string, model: string, messages: ChatMessage[], systemPrompt: string) {
  const formatted = await Promise.all(
    messages
      .filter(m => m.role !== 'system')
      .map(async m => {
        if (typeof m.content === 'string') {
          return { role: m.role, content: m.content };
        }
        const content = await Promise.all(
          (m.content as MessagePart[]).map(async p => {
            if (p.type === 'text') return { type: 'text', text: p.text };
            const { data, mimeType } = await toBase64(p.image_url.url);
            return { type: 'image', source: { type: 'base64', media_type: mimeType, data } };
          })
        );
        return { role: m.role, content };
      })
  );

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, system: systemPrompt, messages: formatted, max_tokens: 2048 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic hatası');
  return data.content?.[0]?.text as string ?? '';
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { provider, model, apiKey, messages, systemPrompt } = await req.json() as {
    provider: 'openai' | 'gemini' | 'anthropic';
    model: string;
    apiKey: string;
    messages: ChatMessage[];
    systemPrompt?: string;
  };

  if (!apiKey) return NextResponse.json({ error: 'API anahtarı gerekli' }, { status: 400 });

  try {
    let reply = '';
    const sys = systemPrompt ?? '';

    if (provider === 'openai') {
      const withSys: ChatMessage[] = sys ? [{ role: 'system', content: sys }, ...messages] : messages;
      reply = await callOpenAI(apiKey, model, withSys);
    } else if (provider === 'gemini') {
      reply = await callGemini(apiKey, model, messages, sys);
    } else if (provider === 'anthropic') {
      reply = await callAnthropic(apiKey, model, messages, sys);
    } else {
      return NextResponse.json({ error: 'Geçersiz sağlayıcı' }, { status: 400 });
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
