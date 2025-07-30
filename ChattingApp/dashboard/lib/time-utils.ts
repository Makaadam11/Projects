export type TimeUnit = 'auto' | 'seconds' | 'minutes' | 'hours';

export interface TimeFormat {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
}

export const parseTime = (timeValue: number | string): TimeFormat => {
  // Convert to seconds (assuming input can be in various formats)
  let totalSeconds: number;
  
  if (typeof timeValue === 'string') {
    totalSeconds = parseFloat(timeValue) || 0;
  } else {
    totalSeconds = timeValue || 0;
  }
  
  // If value is very large, it might be in milliseconds
  if (totalSeconds > 86400) { // > 24h in seconds
    totalSeconds = totalSeconds / 1000;
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    totalMinutes: totalSeconds / 60,
    totalHours: totalSeconds / 3600
  };
};

export const formatTime = (timeValue: number | string, unit: TimeUnit = 'auto'): string => {
  const time = parseTime(timeValue);
  
  switch (unit) {
    case 'seconds':
      return `${Math.round(time.totalSeconds)}s`;
    
    case 'minutes':
      return `${Math.round(time.totalMinutes)}m`;
    
    case 'hours':
      return `${time.totalHours.toFixed(1)}h`;
    
    case 'auto':
    default:
      if (time.totalSeconds < 60) {
        return `${time.seconds}s`;
      } else if (time.totalSeconds < 3600) {
        return time.seconds > 0 
          ? `${time.minutes}m ${time.seconds}s`
          : `${time.minutes}m`;
      } else {
        const parts = [];
        if (time.hours > 0) parts.push(`${time.hours}h`);
        if (time.minutes > 0) parts.push(`${time.minutes}m`);
        if (time.seconds > 0 && time.hours === 0) parts.push(`${time.seconds}s`);
        return parts.join(' ') || '0s';
      }
  }
};