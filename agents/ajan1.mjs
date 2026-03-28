/**
 * AJAN 1 — Ekran Görüntüsü
 * Kullanım: node agents/1-screenshot.mjs [sayfa]
 *
 * Sayfalar: login | dashboard | admin | leaderboard | messages | group-chat | workspace | reports
 * Örnek:    node agents/1-screenshot.mjs dashboard
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const PAGES = {
  login:      '/',
  dashboard:  '/dashboard',
  admin:      '/admin',
  leaderboard:'/leaderboard',
  messages:   '/dashboard/messages',
  'group-chat':'/dashboard/group-chat',
  workspace:  '/dashboard/workspace',
  reports:    '/admin/reports',
  employees:  '/admin/employees',
  notes:      '/admin/notes',
};

// Aktif portu bul
async function findPort() {
  for (const port of [3000, 3002, 3003, 3001]) {
    try {
      const res = await fetch(`http://localhost:${port}`).catch(() => null);
      if (res) return port;
    } catch {}
  }
  return 3002;
}

const arg = process.argv[2] ?? 'login';
const route = PAGES[arg] ?? arg;

console.log(`\n📸 AJAN 1 — Ekran Görüntüsü`);
console.log(`Sayfa: ${arg}`);

const port = await findPort();
const url = `http://localhost:${port}${route}`;
console.log(`URL:   ${url}`);

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

try {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000)); // animasyonların bitmesini bekle

  const dir = 'agents/screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `${arg}-${Date.now()}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✅ Kaydedildi: ${file}`);
} catch (err) {
  console.error(`❌ Hata: ${err.message}`);
  console.log('💡 Dev server çalışıyor mu? pnpm dev ile başlat.');
}

await browser.close();
