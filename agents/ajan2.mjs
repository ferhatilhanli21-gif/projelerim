/**
 * AJAN 2 — Veritabanı Raporu
 * Kullanım: node agents/2-db-report.mjs [komut]
 *
 * Komutlar: users | sessions | leave | notes | all
 * Örnek:    node agents/2-db-report.mjs all
 */

const BASE = 'https://cexlqabhtarickmymutm.supabase.co/rest/v1';
const KEY  = 'sb_publishable_xiYZOuxIwjt6VfIV08_OxA_bR1L57H0';
const H    = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function query(table, params = '') {
  const res = await fetch(`${BASE}/${table}?${params}`, { headers: H });
  return res.json();
}

function fmt(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}s ${m}dk`;
}

const cmd = process.argv[2] ?? 'all';
console.log(`\n📊 AJAN 2 — Veritabanı Raporu [${cmd}]\n`);

// ── KULLANICILAR ──────────────────────────────
if (cmd === 'users' || cmd === 'all') {
  const users = await query('profiles', 'select=full_name,username,role,is_active&order=role.asc');
  console.log('👥 KULLANICILAR');
  console.log('─'.repeat(45));
  for (const u of users) {
    const rol  = u.role === 'admin' ? '👑 Admin   ' : '👤 Çalışan ';
    const aktif = u.is_active ? '🟢' : '🔴';
    console.log(`  ${aktif} ${rol} ${u.full_name} (@${u.username})`);
  }
  const admins    = users.filter(u => u.role === 'admin').length;
  const employees = users.filter(u => u.role === 'employee').length;
  console.log(`\n  Toplam: ${users.length} kullanıcı (${admins} admin, ${employees} çalışan)\n`);
}

// ── AKTİF MESAİLER ───────────────────────────
if (cmd === 'sessions' || cmd === 'all') {
  const active = await query('work_sessions', 'clock_out=is.null&select=clock_in,user_id');
  console.log('⏱️  AKTİF MESAİLER');
  console.log('─'.repeat(45));
  if (active.length === 0) {
    console.log('  Şu an aktif mesai yok.\n');
  } else {
    for (const s of active) {
      const since = new Date(s.clock_in).toLocaleTimeString('tr-TR');
      const mins  = Math.round((Date.now() - new Date(s.clock_in)) / 60000);
      console.log(`  🟢 ${since} başladı — ${fmt(mins)} süredir aktif`);
    }
    console.log('');
  }

  // Son 10 oturum
  const recent = await query('daily_summaries', 'order=work_date.desc&limit=10&select=work_date,total_minutes,user_id');
  console.log('📅 SON GÜNLÜK ÖZETLER');
  console.log('─'.repeat(45));
  for (const r of recent) {
    console.log(`  ${r.work_date}  →  ${fmt(r.total_minutes)}`);
  }
  console.log('');
}

// ── İZİN TALEPLERİ ───────────────────────────
if (cmd === 'leave' || cmd === 'all') {
  const leave = await query('leave_requests', 'order=created_at.desc&limit=10&select=type,status,reason,request_date');
  console.log('📋 İZİN TALEPLERİ (son 10)');
  console.log('─'.repeat(45));
  const icons = { leave: '🏖️', late: '⏰', early: '🚪' };
  const stat  = { pending: '🟡 Bekliyor', approved: '🟢 Onaylandı', rejected: '🔴 Reddedildi' };
  for (const r of leave) {
    console.log(`  ${icons[r.type]} ${r.request_date}  ${stat[r.status]}  — ${r.reason?.slice(0, 40)}`);
  }
  if (leave.length === 0) console.log('  Kayıt yok.');
  console.log('');
}

// ── NOTLAR ───────────────────────────────────
if (cmd === 'notes' || cmd === 'all') {
  const notes = await query('daily_notes', 'order=work_date.desc&limit=5&select=work_date,body');
  console.log('📝 SON GÜNLÜK NOTLAR');
  console.log('─'.repeat(45));
  for (const n of notes) {
    console.log(`  ${n.work_date}: ${n.body?.slice(0, 60)}...`);
  }
  if (notes.length === 0) console.log('  Kayıt yok.');
  console.log('');
}

console.log('✅ Rapor tamamlandı.');
