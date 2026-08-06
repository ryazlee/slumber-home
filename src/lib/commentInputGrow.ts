import { useLayoutEffect, type RefObject } from 'react';

/** Match app comment fields: grow until 4 lines, then scroll. */
export const WEB_COMMENT_INPUT_MAX_LINES = 4;

/** Autosize a textarea up to `maxLines`, then clip + scroll. */
export function autosizeCommentTextarea(
  el: HTMLTextAreaElement | null,
  maxLines = WEB_COMMENT_INPUT_MAX_LINES,
) {
  if (!el) return;
  const styles = window.getComputedStyle(el);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
  const padTop = Number.parseFloat(styles.paddingTop) || 0;
  const padBottom = Number.parseFloat(styles.paddingBottom) || 0;
  const maxHeight = lineHeight * maxLines + padTop + padBottom;

  el.style.height = 'auto';
  const next = Math.min(el.scrollHeight, maxHeight);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > maxHeight + 1 ? 'auto' : 'hidden';
}

/** Keep a textarea height in sync with its value. */
export function useAutosizeCommentTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxLines = WEB_COMMENT_INPUT_MAX_LINES,
) {
  useLayoutEffect(() => {
    autosizeCommentTextarea(ref.current, maxLines);
  }, [ref, value, maxLines]);
}
