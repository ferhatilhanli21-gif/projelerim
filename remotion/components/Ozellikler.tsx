import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

const FEATURES = [
  { emoji: '⏱️', baslik: 'Mesai Takibi', aciklama: 'Giriş & çıkış saatlerini\notomatik kaydet' },
  { emoji: '📊', baslik: 'Detaylı Raporlar', aciklama: 'Excel ile dışa aktar,\nistatistikleri incele' },
  { emoji: '💬', baslik: 'Ekip İletişimi', aciklama: 'Özel mesaj, grup sohbet\nve duyuru panosu' },
  { emoji: '🤖', baslik: 'AI Asistan', aciklama: 'ChatGPT, Gemini ve Claude\nile çalışma desteği' },
  { emoji: '📋', baslik: 'İzin Yönetimi', aciklama: 'İzin & geç kalma\nbildirimlerini onayla' },
  { emoji: '🏆', baslik: 'Liderboard', aciklama: 'Çalışan performansını\ngörsel olarak takip et' },
];

export function Ozellikler() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [-20, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fafafa',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', padding: 60,
    }}>
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        marginBottom: 48, textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#111', margin: 0 }}>
          Her Şey Tek Platformda
        </h2>
        <p style={{ color: '#dc2626', fontSize: 18, marginTop: 8, fontWeight: 500 }}>
          Sor Ajans ile ekibinizi kolayca yönetin
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24, width: '100%', maxWidth: 960,
      }}>
        {FEATURES.map((f, i) => {
          const delay = i * 8;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 100 },
            from: 0, to: 1,
          });
          const cardOpacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              background: 'white',
              borderRadius: 20,
              padding: '28px 24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
              opacity: cardOpacity,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <span style={{ fontSize: 40 }}>{f.emoji}</span>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>{f.baslik}</p>
              <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{f.aciklama}</p>
              <div style={{ width: 32, height: 3, background: '#dc2626', borderRadius: 2, marginTop: 4 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
