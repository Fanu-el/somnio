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

  fmtTime: (iso: string) => dayjs(iso).format('HH:mm'),

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

  createLogDates: (sleepTimeStr: string, wakeTimeStr: string, tz: string, baseDate?: string) => {
    const base = baseDate ? dayjs(baseDate).tz(tz) : dayjs().tz(tz);
    const [sH, sM] = sleepTimeStr.split(':').map(Number);
    let sleepDate = base.hour(sH).minute(sM).second(0).millisecond(0);
    
    const [wH, wM] = wakeTimeStr.split(':').map(Number);
    let wakeDate = base.hour(wH).minute(wM).second(0).millisecond(0);
    
    if (sleepDate.isAfter(wakeDate)) {
      sleepDate = sleepDate.subtract(1, 'day');
    }
    
    return {
      date: base.toISOString(),
      sleepTime: sleepDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
    };
  },

  calculateStreak: (logs: any[]) => {
    if (!logs.length) return 0;
    // Use each log's own timezone for the date string so cross-midnight logs count correctly
    const dates = new Set(
      logs.map(l => {
        const tz = l.timezone || 'UTC';
        return dayjs(l.date).tz(tz).format('YYYY-MM-DD');
      })
    );
    let streak = 0;
    let d = dayjs();
    while (dates.has(d.format('YYYY-MM-DD'))) {
      streak++;
      d = d.subtract(1, 'day');
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
