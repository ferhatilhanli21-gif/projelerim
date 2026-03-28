import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Acilis } from './components/Acilis';
import { Ozellikler } from './components/Ozellikler';
import { Kapanis } from './components/Kapanis';

// Sahne sınırları (30fps)
const SCENE1_END  = 90;   // 0-90:  Açılış (3 sn)
const SCENE2_END  = 270;  // 90-270: Özellikler (6 sn)
const TOTAL       = 360;  // 270-360: Kapanış (3 sn)

function fadeTransition(frame: number, start: number, duration = 15) {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

export function SorAjansTanitim() {
  const frame = useCurrentFrame();

  const scene1Opacity = frame < SCENE1_END - 10
    ? 1
    : fadeTransition(frame, SCENE1_END - 10);

  const scene2Opacity = frame < SCENE1_END
    ? 0
    : frame < SCENE2_END - 10
      ? interpolate(frame, [SCENE1_END, SCENE1_END + 15], [0, 1], { extrapolateRight: 'clamp' })
      : fadeTransition(frame, SCENE2_END - 10);

  const scene3Opacity = frame < SCENE2_END
    ? 0
    : interpolate(frame, [SCENE2_END, SCENE2_END + 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* Sahne 1 — Açılış */}
      <AbsoluteFill style={{ opacity: scene1Opacity }}>
        <Acilis />
      </AbsoluteFill>

      {/* Sahne 2 — Özellikler */}
      <AbsoluteFill style={{ opacity: scene2Opacity }}>
        <Ozellikler />
      </AbsoluteFill>

      {/* Sahne 3 — Kapanış */}
      <AbsoluteFill style={{ opacity: scene3Opacity }}>
        <Kapanis />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
