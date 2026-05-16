export interface SleepRecord {
  id: string;
  date: string;       // ISO string (the calendar date)
  sleepTime: string;  // ISO string
  wakeTime: string;   // ISO string
  timezone: string;
  quality: 1 | 2 | 3 | 4 | 5;
  dreams?: string;
  emoji?: string;
  synced?: boolean;
}

export interface SleepStats {
  averageQuality: number;
  averageDurationHrs: number;
  totalRecords: number;
  streak: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
