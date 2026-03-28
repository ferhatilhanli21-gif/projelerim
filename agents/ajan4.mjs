/**
 * AJAN 4 — Canlı İzleme
 * Kullanım: node agents/4-monitor.mjs [saniye]
 *
 * Aktif mesaileri, çalışan durumlarını ve bekleyen
 * izin taleplerini gerçek zamanlı takip eder.
 *
 * Örnek: node agents/4-monitor.mjs 10   (10 saniyede bir yenile)
 */

const BASE     = 'https://cexlqabhtarickmymutm.supabase.co/rest/v1';
const KEY      = 'sb_publishable_xiYZOuxIwjt6VfIV08_OxA_bR1L57H0';
const H        = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const INTERVAL = parseInt(process.argv[2] ?? '15') * 1000;

async function q(table, params = '') {
  const res = await fetch(`${BASE}/${table}?${params}`, { headers: H });
  return res.json();
}

function fmt(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function clear() { process.stdout.write('\x1Bc'); }

async function render() {
  const now = new Date().toLocaleTimeString('tr-TR');

  const [users, activeSessions, pending] = await Promise.all([
    q('profiles', 'select=id,full_name,role&is_active=eq.true'),
    q('work_sessions', 'clock_out=is.null&select=user_id,clock_in'),
    q('leave_requests', 'status=eq.pending&select=id,type'),
  ]);

  const activeIds = new Set(activeSessions.map(s => s.user_id));

  clear();
  console.log('╔══════════════════════════════════════════════╗');
  console.log(`║   🔴 SOR AJANS — CANLI İZLEME  ${now}  ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  👥 Toplam Çalışan: ${String(users.length).padEnd(3)} `+
              `  ⏱️  Aktif: ${String(activeSessions.length).padEnd(3)} `+
              `  📋 Bekleyen İzin: ${pending.length}  ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  DURUM     İSİM                   ROL       ║');
  console.log('╟──────────────────────────────────────────────╢');

  for (const u of users) {
    const isActive = activeIds.has(u.id);
    const session  = activeSessions.find(s => s.user_id === u.id);
    const since    = session
      ? fmt(Math.round((Date.now() - new Date(session.clock_in)) / 60000)) + ' süredir'
      : '—';
    const status = isActive ? '🟢 Çalışıyor' : '⚫ Pasif     ';
    const rol    = u.role === 'admin' ? '👑 Admin  ' : '👤 Çalışan';
    const name   = u.full_name.padEnd(22).slice(0, 22);
    console.log(`║  ${status}  ${name}  ${rol}  ║`);
    if (isActive) {
      console.log(`║             └─ ${since.padEnd(37)}║`);
    }
  }

  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n  🔄 ${INTERVAL / 1000} saniyede bir yenileniyor... Durdurmak için Ctrl+C\n`);
}

await render();
setInterval(render, INTERVAL);
