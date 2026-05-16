import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import * as Localization from 'expo-localization';

dayjs.extend(utc);
dayjs.extend(timezone);

// Initialize with user's current timezone
const deviceTimezone = Localization.getCalendars()[0]?.timeZone || dayjs.tz.guess() || 'UTC';

export const dateUtils = {
  getDeviceTimezone: () => deviceTimezone,

  formatDuration: (sleepIso: string, wakeIso: string) => {
    const diff = new Date(wakeIso).getTime() - new Date(sleepIso).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  },

  fmtTime: (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

  getGreeting: () => {
    const h = dayjs().hour();
    if (h < 5)  return { text: 'Still up?',       type: 'late' };
    if (h < 12) return { text: 'Good morning',     type: 'morning' };
    if (h < 17) return { text: 'Good afternoon',   type: 'afternoon' };
    if (h < 21) return { text: 'Good evening',     type: 'evening' };
    return       { text: 'Good night',             type: 'night' };
  },

  formatFullDate: (date: string | Date = new Date()) => {
    return new Date(date).toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  },

  createLogDates: (sleepTimeStr: string, wakeTimeStr: string, tz: string) => {
    const now = dayjs().tz(tz);
    const [sH, sM] = sleepTimeStr.split(':').map(Number);
    let sleepDate = now.hour(sH).minute(sM).second(0).millisecond(0);
    
    const [wH, wM] = wakeTimeStr.split(':').map(Number);
    let wakeDate = now.hour(wH).minute(wM).second(0).millisecond(0);
    
    if (sleepDate.isAfter(wakeDate)) {
      sleepDate = sleepDate.subtract(1, 'day');
    }
    
    return {
      date: now.toISOString(),
      sleepTime: sleepDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
    };
  },

  calculateStreak: (logs: any[]) => {
    if (!logs.length) return 0;
    const dates = logs.map(l => new Date(l.date).toDateString());
    let streak = 0;
    const d = new Date();
    while (dates.includes(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }
};

export const COMMON_TIMEZONES = [
  deviceTimezone,
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
  'UTC',
];

export const UNIQUE_TIMEZONES = Array.from(new Set(COMMON_TIMEZONES));
