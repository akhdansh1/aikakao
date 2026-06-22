/**
 * Util format waktu relatif terhadap waktu sekarang, supaya data
 * (baik mock maupun hasil scan asli) selalu terasa "baru" kapan pun
 * aplikasi dibuka — tidak terikat ke tanggal/jam yang di-hardcode.
 */

export function formatRelativeTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1 || isYesterday(date, now)) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(date, yesterday);
}

/** Membuat objek Date relatif terhadap sekarang, untuk keperluan mock data. */
export function dateOffsetFromNow(opts: {
  minutesAgo?: number;
  hoursAgo?: number;
  daysAgo?: number;
}): Date {
  const now = new Date();
  const ms =
    (opts.minutesAgo ?? 0) * 60_000 +
    (opts.hoursAgo ?? 0) * 3_600_000 +
    (opts.daysAgo ?? 0) * 86_400_000;
  return new Date(now.getTime() - ms);
}
