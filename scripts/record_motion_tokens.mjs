import fs from 'fs';
import { motionTokens } from '../client/src/styles/motion.js';
import tokens from '../client/src/styles/tokens.js';

const baselineMotion = {
  timestamp: new Date().toISOString(),
  motionTokens,
  tokens,
  checksums: {
    duration_instant: motionTokens.duration.instant,
    duration_fast: motionTokens.duration.fast,
    duration_base: motionTokens.duration.base,
    duration_slow: motionTokens.duration.slow,
    duration_hero: motionTokens.duration.hero,
    easing_standard: motionTokens.easing.standard,
    easing_enter: motionTokens.easing.enter,
    easing_exit: motionTokens.easing.exit,
    stagger_fast: motionTokens.stagger.fast,
    stagger_base: motionTokens.stagger.base,
    distance_reveal: motionTokens.distance.reveal,
    distance_hero: motionTokens.distance.hero,
  },
};

const targetDir = 'baselines/proof-of-no-change/motion-tokens';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

fs.writeFileSync(`${targetDir}/motion-baseline.json`, JSON.stringify(baselineMotion, null, 2));
console.log('Successfully recorded baselines/proof-of-no-change/motion-tokens/motion-baseline.json');
