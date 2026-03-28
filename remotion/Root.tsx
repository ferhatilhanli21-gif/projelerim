import { Composition } from 'remotion';
import { SorAjansTanitim } from './SorAjansTanitim';

export function RemotionRoot() {
  return (
    <Composition
      id="SorAjansTanitim"
      component={SorAjansTanitim}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
  );
}
