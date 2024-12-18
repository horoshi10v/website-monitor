export function useTimeFormatting() {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes()
      .toString()
      .padStart(2, '0')} ${d.toLocaleDateString()}`;
  };

  const getNextCheckIn = (lastChecked: string | undefined, interval: number, currentTime: number) => {
    if (!lastChecked) return 'N/A';
    const lastCheckedTime = new Date(lastChecked).getTime();
    const nextCheckTime = lastCheckedTime + interval * 60000;
    const diff = nextCheckTime - currentTime;

    if (diff <= 0) return '0s';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return { formatDate, getNextCheckIn };
}
