export function formatTrainingTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '-';

  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}m ${remaining.toFixed(2).padStart(5, '0')}s`;
  }

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remaining = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(remaining).padStart(2, '0')}s`;
}
