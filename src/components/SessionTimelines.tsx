import { formatMins } from '../lib/format';
import { hasMultipleSessions, isNapSession } from '../lib/napDay';
import { segmentsForPost } from '../lib/timeline';
import type { SleepPost, SleepSessionData } from '../lib/types';
import PostStageMetrics from './post/PostStageMetrics';
import SessionKindChip from './SessionKindChip';
import SleepTimelineBar from './SleepTimelineBar';

type PostTimelineInput = Pick<
  SleepPost,
  | 'stageSegments'
  | 'sessionBreakdown'
  | 'bedtime'
  | 'wakeTime'
  | 'inBedMinutes'
  | 'coreMinutes'
  | 'deepMinutes'
  | 'remMinutes'
  | 'awakeMinutes'
  | 'awakeEvents'
>;

type Props = {
  post: PostTimelineInput;
  variant?: 'card' | 'detail';
};

function SessionBlock({
  session,
  idx,
  sessions,
  variant,
  isLast,
}: {
  session: SleepSessionData;
  idx: number;
  sessions: SleepSessionData[];
  variant: 'card' | 'detail';
  isLast: boolean;
}) {
  const sessionIsNap = isNapSession(session, idx, sessions);
  const sessionKind = sessionIsNap ? 'nap' : 'overnight';

  if (variant === 'detail') {
    return (
      <div className={`session-timeline-detail${!isLast ? ' session-timeline-detail--divided' : ''}`}>
        <p className="session-timeline-detail-header">
          <SessionKindChip kind={sessionKind} always size="sm" />
          <span className="session-timeline-detail-meta">
            {session.bedtime} to {session.wakeTime} · {formatMins(session.asleepMinutes)}
          </span>
        </p>
        <SleepTimelineBar
          segments={session.segments}
          bedtime={session.bedtime}
          wakeTime={session.wakeTime}
          variant="detail"
        />
        <PostStageMetrics data={session} labelStyle="title" className="post-stage-metrics--session" />
      </div>
    );
  }

  return (
    <div className={`session-timeline-card${sessionIsNap ? ' session-timeline-card--nap' : ' session-timeline-card--overnight'}`}>
      <div className="session-timeline-card-header">
        <SessionKindChip kind={sessionKind} always size="sm" />
      </div>
      <SleepTimelineBar
        segments={session.segments}
        bedtime={session.bedtime}
        wakeTime={session.wakeTime}
        variant="card"
        showClockLabels={false}
      />
      <div className="session-timeline-time-row">
        <span>{session.bedtime}</span>
        <span>{session.wakeTime}</span>
      </div>
    </div>
  );
}

export default function SessionTimelines({ post, variant = 'card' }: Props) {
  const sessions = post.sessionBreakdown ?? [];
  const segments = segmentsForPost(post);

  if (hasMultipleSessions(post)) {
    return (
      <div className="session-timelines">
        {sessions.map((session, idx) => (
          <SessionBlock
            key={`session-${idx}`}
            session={session}
            idx={idx}
            sessions={sessions}
            variant={variant}
            isLast={idx === sessions.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <SleepTimelineBar
      segments={segments}
      bedtime={post.bedtime}
      wakeTime={post.wakeTime}
      sessionBreakdown={post.sessionBreakdown}
      variant={variant}
    />
  );
}
