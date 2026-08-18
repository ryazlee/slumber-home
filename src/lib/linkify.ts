/** Detect http(s) and www. URLs in free text (notes, dreams, comments). */

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;

export type UrlSpan = {
  start: number;
  end: number;
  display: string;
  href: string;
};

function countChar(s: string, ch: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === ch) n += 1;
  }
  return n;
}

export function peelTrailingUrlPunctuation(raw: string): string {
  let url = raw;
  while (/[.,;:!?]$/.test(url)) {
    url = url.slice(0, -1);
  }
  while (url.endsWith(')') && countChar(url, '(') < countChar(url, ')')) {
    url = url.slice(0, -1);
  }
  while (url.endsWith(']') && countChar(url, '[') < countChar(url, ']')) {
    url = url.slice(0, -1);
  }
  return url;
}

export function hrefForDetectedUrl(display: string): string {
  if (/^https?:\/\//i.test(display)) return display;
  return `https://${display}`;
}

function isPlausibleUrl(display: string): boolean {
  const hostAndPath = display.replace(/^https?:\/\//i, '');
  const host = hostAndPath.split(/[/?#]/)[0] ?? '';
  return host.includes('.') && host.length >= 4;
}

export function findUrlSpans(text: string): UrlSpan[] {
  const spans: UrlSpan[] = [];
  const re = new RegExp(URL_PATTERN.source, 'gi');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const display = peelTrailingUrlPunctuation(match[0]);
    if (!isPlausibleUrl(display)) continue;
    spans.push({
      start: match.index,
      end: match.index + display.length,
      display,
      href: hrefForDetectedUrl(display),
    });
  }
  return spans;
}
