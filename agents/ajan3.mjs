/**
 * AJAN 3 — Git İşlemleri
 * Kullanım: node agents/3-git.mjs [komut] [mesaj]
 *
 * Komutlar:
 *   push  [mesaj]  — Değişiklikleri commit et ve GitHub'a gönder
 *   status         — Değişiklikleri göster
 *   log            — Son commitleri listele
 *   pull           — GitHub'dan son değişiklikleri çek
 *
 * Örnek: node agents/3-git.mjs push "login sayfası güncellendi"
 */

import { execSync } from 'child_process';

function run(cmd, silent = false) {
  try {
    const out = execSync(cmd, {
      cwd: 'c:\\Users\\HP VICTUS\\Music\\5412\\sor-ajans-work-tracker',
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'pipe',
    });
    return out.trim();
  } catch (err) {
    return err.stdout?.trim() || err.message;
  }
}

const cmd = process.argv[2] ?? 'status';
const msg = process.argv[3] ?? `güncelleme ${new Date().toLocaleDateString('tr-TR')}`;

console.log(`\n🔧 AJAN 3 — Git [${cmd}]\n`);

if (cmd === 'status') {
  console.log('📁 Değişen dosyalar:');
  console.log('─'.repeat(45));
  const status = run('git status --short');
  if (!status) {
    console.log('  Değişiklik yok — her şey temiz.');
  } else {
    console.log(status.split('\n').map(l => '  ' + l).join('\n'));
  }

  const branch = run('git branch --show-current');
  const remote = run('git remote get-url origin');
  console.log(`\n🌿 Branch: ${branch}`);
  console.log(`🔗 Remote: ${remote}`);
}

else if (cmd === 'push') {
  console.log('📦 Değişiklikler stage ediliyor...');
  run('git add .');

  const status = run('git status --short');
  if (!status) {
    console.log('✅ Değişiklik yok, push gerekmiyor.');
    process.exit(0);
  }

  console.log('💬 Commit mesajı: ' + msg);
  const commit = run(`git commit -m "${msg}"`);
  console.log(commit);

  console.log('🚀 GitHub\'a gönderiliyor...');
  const push = run('git push');
  console.log(push || '✅ Push tamamlandı.');

  console.log('\n🔗 Repo: https://github.com/ferhatilhanli21-gif/projelerim');
}

else if (cmd === 'log') {
  console.log('📜 Son commitler:');
  console.log('─'.repeat(45));
  const log = run('git log --oneline -10');
  console.log(log.split('\n').map(l => '  ' + l).join('\n'));
}

else if (cmd === 'pull') {
  console.log('⬇️  GitHub\'dan çekiliyor...');
  const pull = run('git pull');
  console.log(pull);
}

else {
  console.log('Geçersiz komut. Kullanım:');
  console.log('  node agents/3-git.mjs status');
  console.log('  node agents/3-git.mjs push "mesaj"');
  console.log('  node agents/3-git.mjs log');
  console.log('  node agents/3-git.mjs pull');
}
