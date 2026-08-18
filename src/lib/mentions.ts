/** @username mention parsing. */

import { findUrlSpans } from './linkify';
import { USERNAME_MENTION_PATTERN } from './username';

export function extractMentionUsernames(text: string): string[] {
  const regex = new RegExp(`@(${USERNAME_MENTION_PATTERN})`, 'gi');
  const seen = new Set<string>();
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    if (!seen.has(username)) {
      seen.add(username);
      result.push(username);
    }
  }
  return result;
}

export type MentionSegment =
  | { type: 'text'; value: string }
  | { type: 'mention'; username: string }
  | { type: 'link'; value: string; href: string };

function parseMentionOnlySegments(text: string): MentionSegment[] {
  if (!text) return [];
  const regex = new RegExp(`@(${USERNAME_MENTION_PATTERN})`, 'gi');
  const segments: MentionSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'mention', username: match[1].toLowerCase() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

export function parseMentionSegments(text: string): MentionSegment[] {
  const urls = findUrlSpans(text);
  if (urls.length === 0) {
    const mentions = parseMentionOnlySegments(text);
    return mentions.length ? mentions : [{ type: 'text', value: text }];
  }

  const segments: MentionSegment[] = [];
  let lastIndex = 0;
  for (const url of urls) {
    if (url.start > lastIndex) {
      segments.push(...parseMentionOnlySegments(text.slice(lastIndex, url.start)));
    }
    segments.push({ type: 'link', value: url.display, href: url.href });
    lastIndex = url.end;
  }
  if (lastIndex < text.length) {
    segments.push(...parseMentionOnlySegments(text.slice(lastIndex)));
  }
  return segments.length ? segments : [{ type: 'text', value: text }];
}

/** Strava-style flat reply — prepopulate the composer with @author. */
export function buildCommentReplyPrefix(username: string): string {
  return `@${username.toLowerCase()} `;
}
