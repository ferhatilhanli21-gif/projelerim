/**
 * AJAN 5 — Yedekleme
 * Kullanım: node agents/5-backup.mjs [format]
 *
 * Format: json | summary
 * Örnek:  node agents/5-backup.mjs json
 *
 * Tüm verileri agents/backups/ klasörüne kaydeder.
 */

import fs from 'fs';
import path from 'path';

const BASE = 'https://cexlqabhtarickmymutm.supabase.co/rest/v1';
const KEY  = 'sb_publishable_xiYZOuxIwjt6VfIV08_OxA_bR1L57H0';
const H    = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const FMT  = process.argv[2] ?? 'json';

async function q(table, params = '') {
  const res = await fetch(`${BASE}/${table}?${params}&limit=1000`, { headers: H });
  return res.json();
}

const dir = 'agents/backups';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('\n💾 AJAN 5 — Yedekleme\n');
console.log('📡 Veriler çekiliyor...\n');

const [profiles, sessions, summaries, notes, announcements, leave, messages] = await Promise.all([
  q('profiles',      'select=id,full_name,username,role,is_active,created_at'),
  q('work_sessions', 'select=*&order=clock_in.desc'),
  q('daily_summaries','select=*&order=work_date.desc'),
  q('daily_notes',   'select=*&order=work_date.desc'),
  q('announcements', 'select=*&order=created_at.desc'),
  q('leave_requests','select=*&order=created_at.desc'),
  q('messages',      'select=id,sender_id,receiver_id,body,created_at&order=created_at.desc'),
]);

const backup = {
  created_at: new Date().toISOString(),
  project: 'Sor Ajans Work Tracker',
  tables: {
    profiles:      { count: profiles.length,      data: profiles },
    work_sessions: { count: sessions.length,       data: sessions },
    daily_summaries:{ count: summaries.length,     data: summaries },
    daily_notes:   { count: notes.length,          data: notes },
    announcements: { count: announcements.length,  data: announcements },
    leave_requests:{ count: leave.length,          data: leave },
    messages:      { count: messages.length,       data: messages },
  },
};

if (FMT === 'json') {
  const file = path.join(dir, `backup-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`✅ JSON yedeği kaydedildi: ${file}`);
}

// Her zaman özet göster
console.log('\n📊 YEDEKLEME ÖZETİ');
console.log('─'.repeat(40));
for (const [tablo, info] of Object.entries(backup.tables)) {
  console.log(`  ${tablo.padEnd(20)} ${String(info.count).padStart(4)} kayıt`);
}
console.log('─'.repeat(40));
const total = Object.values(backup.tables).reduce((s, t) => s + t.count, 0);
console.log(`  ${'TOPLAM'.padEnd(20)} ${String(total).padStart(4)} kayıt`);

// En aktif çalışan
const topUser = profiles.find(p => p.role === 'employee');
if (topUser) {
  const userSessions = sessions.filter(s => s.user_id === topUser.id);
  console.log(`\n💡 Toplam ${profiles.length} kullanıcı, ${sessions.length} mesai oturumu yedeklendi.`);
}

console.log('\n✅ Yedekleme tamamlandı.');
