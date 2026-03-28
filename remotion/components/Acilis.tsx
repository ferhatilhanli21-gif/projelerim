import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export function Acilis() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, from: 0, to: 1 });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(frame, [20, 50], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const circleScale = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative',
    }}>
      {/* Arka plan daireler */}
      {[
        { size: 500, x: -100, y: -100, opacity: 0.08 },
        { size: 350, x: 800, y: 400, opacity: 0.06 },
        { size: 200, x: 600, y: -50, opacity: 0.1 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: c.size, height: c.size,
          borderRadius: '50%',
          background: 'white',
          opacity: c.opacity * circleScale,
          left: c.x, top: c.y,
        }} />
      ))}

      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        background: 'white',
        borderRadius: 24,
        padding: '20px 48px',
        marginBottom: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <span style={{
          fontSize: 72, fontWeight: 900, color: '#dc2626',
          letterSpacing: '-2px',
        }}>
          SOR AJANS
        </span>
      </div>

      {/* Tagline */}
      <div style={{
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
        textAlign: 'center',
      }}>
        <p style={{ color: 'white', fontSize: 28, margin: 0, fontWeight: 300, letterSpacing: 2 }}>
          Akıllı Mesai Takip Sistemi
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: 8 }}>
          Ekibinizi tek platformdan yönetin
        </p>
      </div>
    </div>
  );
}
