import type { StageSegment } from '../lib/types';
import PostStageMetrics from './post/PostStageMetrics';
import SleepTimelineBar from './SleepTimelineBar';

/** Sample overnight matching a typical good night (~7h 12m asleep). */
const HOME_DEMO_SEGMENTS: StageSegment[] = [
  { type: 'CORE', minutes: 28 },
  { type: 'DEEP', minutes: 42 },
  { type: 'CORE', minutes: 36 },
  { type: 'REM', minutes: 48 },
  { type: 'AWAKE', minutes: 7 },
  { type: 'CORE', minutes: 40 },
  { type: 'DEEP', minutes: 32 },
  { type: 'CORE', minutes: 34 },
  { type: 'REM', minutes: 44 },
  { type: 'AWAKE', minutes: 5 },
  { type: 'CORE', minutes: 46 },
  { type: 'DEEP', minutes: 14 },
  { type: 'CORE', minutes: 36 },
  { type: 'REM', minutes: 32 },
];

const HOME_DEMO_STAGES = {
  coreMinutes: 220,
  deepMinutes: 88,
  remMinutes: 124,
  awakeMinutes: 12,
  awakeEvents: 2,
} as const;

export default function HomeHypnogram() {
  return (
    <div className="home-night-card">
      <div className="home-night-top">
        <div>
          <p className="home-night-kicker">Last night</p>
          <p className="home-night-duration">7h 12m</p>
        </div>
        <p className="home-night-times">
          <span>10:42 PM</span>
          <span className="home-night-arrow" aria-hidden="true">
            →
          </span>
          <span>6:31 AM</span>
        </p>
      </div>

      <div className="home-hypnogram">
        <SleepTimelineBar
          segments={HOME_DEMO_SEGMENTS}
          bedtime="10:42 PM"
          wakeTime="6:31 AM"
          variant="card"
          showClockLabels={false}
        />
        <div className="home-hypno-breakdown">
          <PostStageMetrics data={HOME_DEMO_STAGES} scrollable />
        </div>
      </div>
    </div>
  );
}
