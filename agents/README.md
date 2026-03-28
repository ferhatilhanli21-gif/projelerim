# Sor Ajans — Ajan Listesi

| Ajan | Görev | Komut |
|------|-------|-------|
| **Ajan 1** | 📸 Ekran Görüntüsü — sitenin herhangi bir sayfasını fotoğraflar | `node agents/ajan1.mjs [sayfa]` |
| **Ajan 2** | 📊 Veritabanı Raporu — çalışanlar, mesailer, izinler, notları listeler | `node agents/ajan2.mjs [all/users/sessions/leave/notes]` |
| **Ajan 3** | 🔧 Git İşlemleri — GitHub'a kaydet ve gönder | `node agents/ajan3.mjs [push/status/log/pull] [mesaj]` |
| **Ajan 4** | 👁️ Canlı İzleme — kim çalışıyor, ne kadar süredir, bekleyen izinler | `node agents/ajan4.mjs [saniye]` |
| **Ajan 5** | 💾 Yedekleme — tüm veriyi JSON dosyasına yedekler | `node agents/ajan5.mjs` |

## Örnekler

```bash
node agents/ajan1.mjs admin          # Admin sayfası ekran görüntüsü
node agents/ajan2.mjs all            # Tüm raporu göster
node agents/ajan3.mjs push "güncelleme"  # GitHub'a gönder
node agents/ajan4.mjs 10             # 10 saniyede bir yenile
node agents/ajan5.mjs                # Yedek al
```
