import ExpandableMentionText from '../ExpandableMentionText';
import MentionText from '../MentionText';
import PrivateDreamMentionHint from '../PrivateDreamMentionHint';
import { extractMentionUsernames } from '../../lib/mentions';
import { DREAM_MOOD_CONFIG, dreamMoodColor } from '../../lib/sleepPostMeta';
import type { DreamMood } from '../../lib/types';

type Props = {
  dreamLog: string;
  dreamMood?: DreamMood;
  canReadDream: boolean;
  blurDream: boolean;
  variant?: 'feed' | 'detail';
  onMentionPress?: (username: string) => void;
};

function DreamHeader({
  dreamMood,
  blurDream,
}: {
  dreamMood?: DreamMood;
  blurDream: boolean;
}) {
  const moodMeta = dreamMood ? DREAM_MOOD_CONFIG[dreamMood] : undefined;
  if (!moodMeta && !blurDream) return null;

  return (
    <div className="post-dream-header">
      {moodMeta && dreamMood ? (
        <p className="post-dream-mood" style={{ color: dreamMoodColor(dreamMood) }}>
          <span aria-hidden>{moodMeta.emoji}</span> {moodMeta.label}
        </p>
      ) : null}
      {blurDream ? <span className="post-dream-badge">Private</span> : null}
    </div>
  );
}

export default function PostDreamBlock({
  dreamLog,
  dreamMood,
  canReadDream,
  blurDream,
  variant = 'feed',
  onMentionPress,
}: Props) {
  if (!dreamLog) return null;

  const dreamMentionUsernames = extractMentionUsernames(dreamLog);
  const showHeader = Boolean(dreamMood) || blurDream;

  return (
    <div className="post-dream">
      {showHeader ? (
        <DreamHeader dreamMood={dreamMood} blurDream={blurDream || !canReadDream} />
      ) : null}
      {canReadDream ? (
        variant === 'feed' ? (
          <ExpandableMentionText
            className="post-dream-text"
            onMentionPress={onMentionPress}
          >
            {dreamLog}
          </ExpandableMentionText>
        ) : (
          <p className="post-dream-text">
            <MentionText onMentionPress={onMentionPress}>{dreamLog}</MentionText>
          </p>
        )
      ) : (
        <>
          {dreamMentionUsernames.length > 0 ? (
            <PrivateDreamMentionHint
              usernames={dreamMentionUsernames}
              onMentionPress={onMentionPress}
            />
          ) : (
            <p className="post-dream-hint">Dream logged (only they can read it)</p>
          )}
        </>
      )}
    </div>
  );
}
