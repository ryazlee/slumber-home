import { parseMentionSegments } from '../lib/mentions';

type MentionTextProps = {
  children: string;
  className?: string;
  onMentionPress?: (username: string) => void;
};

export default function MentionText({ children, className, onMentionPress }: MentionTextProps) {
  const segments = parseMentionSegments(children);

  if (segments.length === 1 && segments[0].type === 'text') {
    return <span className={className}>{segments[0].value}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'mention') {
          return onMentionPress ? (
            <button
              key={`${seg.username}-${i}`}
              type="button"
              className="mention-handle mention-handle--link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMentionPress(seg.username);
              }}
            >
              @{seg.username}
            </button>
          ) : (
            <span key={`${seg.username}-${i}`} className="mention-handle">
              @{seg.username}
            </span>
          );
        }
        if (seg.type === 'link') {
          return (
            <a
              key={`link-${i}`}
              className="mention-handle mention-link"
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {seg.value}
            </a>
          );
        }
        return <span key={`text-${i}`}>{seg.value}</span>;
      })}
    </span>
  );
}
