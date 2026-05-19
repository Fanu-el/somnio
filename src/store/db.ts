import * as SQLite from 'expo-sqlite';
import { SleepRecord } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const initDb = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('somnio.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      sleepTime TEXT NOT NULL,
      wakeTime TEXT NOT NULL,
      quality INTEGER NOT NULL,
      dreams TEXT,
      emoji TEXT,
      timezone TEXT,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  const tableInfo = await db.getAllAsync<any>(`PRAGMA table_info(sleep_logs);`);
  const columns = tableInfo.map(row => row.name);

  if (!columns.includes('emoji')) {
    await db.execAsync(`ALTER TABLE sleep_logs ADD COLUMN emoji TEXT;`);
  }
  
  if (!columns.includes('timezone')) {
    await db.execAsync(`ALTER TABLE sleep_logs ADD COLUMN timezone TEXT;`);
  }

  return db;
};

// ── Sleep logs ─────────────────────────────────────────────────
export const insertLog = async (log: SleepRecord) => {
  const database = await initDb();
  await database.runAsync(
    `INSERT INTO sleep_logs (id, date, sleepTime, wakeTime, quality, dreams, emoji, timezone, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.id ?? null, 
      log.date ?? null, 
      log.sleepTime ?? null, 
      log.wakeTime ?? null, 
      log.quality ?? null, 
      log.dreams ?? null, 
      log.emoji ?? null, 
      log.timezone ?? null, 
      log.synced ? 1 : 0
    ]
  );
};

export const upsertLogs = async (logs: SleepRecord[]) => {
  const database = await initDb();
  for (const log of logs) {
    await database.runAsync(
      `INSERT OR REPLACE INTO sleep_logs (id, date, sleepTime, wakeTime, quality, dreams, emoji, timezone, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id ?? null, 
        log.date ?? null, 
        log.sleepTime ?? null, 
        log.wakeTime ?? null, 
        log.quality ?? null, 
        log.dreams ?? null, 
        log.emoji ?? null, 
        log.timezone ?? null, 
        1
      ]
    );
  }
};

export const getLogs = async (): Promise<SleepRecord[]> => {
  const database = await initDb();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM sleep_logs ORDER BY date DESC'
  );
  return rows.map(row => ({
    id: row.id,
    date: row.date,
    sleepTime: row.sleepTime,
    wakeTime: row.wakeTime,
    quality: row.quality,
    dreams: row.dreams,
    emoji: row.emoji,
    timezone: row.timezone ?? 'UTC',
    synced: row.synced === 1,
  }));
};

export const deleteLogDb = async (id: string) => {
  const database = await initDb();
  await database.runAsync('DELETE FROM sleep_logs WHERE id = ?', [id ?? null]);
};

export const updateLogDb = async (log: SleepRecord) => {
  const database = await initDb();
  await database.runAsync(
    `UPDATE sleep_logs SET date = $date, sleepTime = $sleepTime, wakeTime = $wakeTime, timezone = $timezone, quality = $quality, dreams = $dreams, emoji = $emoji, synced = $synced WHERE id = $id`,
    {
      $date: log.date ?? '', 
      $sleepTime: log.sleepTime ?? '', 
      $wakeTime: log.wakeTime ?? '', 
      $timezone: log.timezone ?? 'UTC', 
      $quality: log.quality ?? 3, 
      $dreams: log.dreams ?? null, 
      $emoji: log.emoji ?? null, 
      $synced: log.synced ? 1 : 0, 
      $id: log.id ?? ''
    }
  );
};

export const markLogsSyncedDb = async (ids: string[]) => {
  if (ids.length === 0) return;
  const database = await initDb();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE sleep_logs SET synced = 1 WHERE id IN (${placeholders})`,
    ids.map(id => id ?? null)
  );
};

// ── Settings ───────────────────────────────────────────────────
export const getSettingDb = async (key: string): Promise<string | null> => {
  const database = await initDb();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key ?? null]
  );
  return row?.value ?? null;
};

export const setSettingDb = async (key: string, value: string) => {
  const database = await initDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key ?? null, value ?? null]
  );
};
