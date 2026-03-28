import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export function Kapanis() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const logoScale = spring({ frame, fps, config: { damping: 10, stiffness: 70 }, from: 0.5, to: 1 });
  const ctaOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctaY = interpolate(frame, [25, 45], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.97, 1.03]);
  const urlOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #111 0%, #1f1f1f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', opacity: bgOpacity,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Arka plan parlaması */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
      }} />

      {/* Logo */}
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 40 }}>
        <div style={{
          background: '#dc2626',
          borderRadius: 20,
          padding: '16px 40px',
          boxShadow: '0 0 40px rgba(220,38,38,0.4)',
        }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
            SOR AJANS
          </span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ opacity: ctaOpacity, transform: `translateY(${ctaY}px)`, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, margin: '0 0 20px 0' }}>
          Ekibinizin verimliliğini artırın
        </p>
        <div style={{
          background: '#dc2626',
          borderRadius: 50,
          padding: '16px 48px',
          transform: `scale(${pulse})`,
          display: 'inline-block',
          boxShadow: '0 8px 30px rgba(220,38,38,0.5)',
        }}>
          <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>
            Hemen Başlayın →
          </span>
        </div>
      </div>

      {/* URL */}
      <div style={{ opacity: urlOpacity, position: 'absolute', bottom: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, margin: 0, letterSpacing: 1 }}>
          sorajans.com.tr
        </p>
      </div>
    </div>
  );
}
