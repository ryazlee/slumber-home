import { useLayoutEffect, useRef, useState } from 'react';
import MentionText from './MentionText';

const PREVIEW_LINES = 4;

type Props = {
  children: string;
  className?: string;
  prefix?: string;
  onMentionPress?: (username: string) => void;
};

export default function ExpandableMentionText({ children, className, prefix = '', onMentionPress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const text = `${prefix}${children}`;

  useLayoutEffect(() => {
    setExpanded(false);
    const el = measureRef.current;
    if (!el || !children.trim()) {
      setNeedsExpand(false);
      return;
    }
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22;
    setNeedsExpand(el.scrollHeight > lineHeight * PREVIEW_LINES + 1);
  }, [children, prefix]);

  if (!children.trim()) return null;

  const collapsed = needsExpand && !expanded;
  const toggleExpanded = () => setExpanded((v) => !v);

  return (
    <div
      className="expandable-mention-text"
      data-post-interactive={needsExpand ? true : undefined}
    >
      <p ref={measureRef} className="expandable-mention-text-measure" aria-hidden>
        <MentionText className={className} onMentionPress={onMentionPress}>{text}</MentionText>
      </p>
      <p
        className={[
          'expandable-mention-text-body',
          className,
          collapsed ? 'expandable-mention-text-body--clamped' : '',
          needsExpand ? 'expandable-mention-text-body--toggleable' : '',
        ].filter(Boolean).join(' ')}
        style={collapsed ? { WebkitLineClamp: PREVIEW_LINES } : undefined}
        onClick={needsExpand ? toggleExpanded : undefined}
        role={needsExpand ? 'button' : undefined}
        tabIndex={needsExpand ? 0 : undefined}
        onKeyDown={needsExpand ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        } : undefined}
        aria-expanded={needsExpand ? expanded : undefined}
      >
        <MentionText onMentionPress={onMentionPress}>{text}</MentionText>
      </p>
      {needsExpand ? (
        <button
          type="button"
          className="expandable-mention-text-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded();
          }}
          aria-expanded={expanded}
        >
          <span className="expandable-mention-text-ellipsis">… </span>
          <span className="expandable-mention-text-action">{expanded ? 'less' : 'more'}</span>
        </button>
      ) : null}
    </div>
  );
}
