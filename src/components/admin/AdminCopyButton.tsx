import { useState } from 'react';

type Props = {
  value: string;
  label?: string;
  title?: string;
};

export default function AdminCopyButton({ value, label = 'Copy', title }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button type="button" className="admin-copy-btn" onClick={copy} title={title ?? `Copy ${value}`}>
      {copied ? 'Copied' : label}
    </button>
  );
}
