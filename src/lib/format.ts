export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string, nowMs: number = Date.now()): string {
  const diffSec = Math.round((new Date(iso).getTime() - nowMs) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'sebentar tadi';
  try {
    const rtf = new Intl.RelativeTimeFormat('ms', { numeric: 'auto' });
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
    return rtf.format(Math.round(diffSec / 86400), 'day');
  } catch {
    return formatDateTime(iso);
  }
}

export function plural(n: number, word: string): string {
  return `${n} ${word}`;
}
