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
  // Add emoji column if it doesn't exist (migration)
  try {
    await db.execAsync(`ALTER TABLE sleep_logs ADD COLUMN emoji TEXT;`);
  } catch { }

  try {
    await db.execAsync(`ALTER TABLE sleep_logs ADD COLUMN timezone TEXT;`);
  } catch { }

  return db;
};

// ── Sleep logs ─────────────────────────────────────────────────
export const insertLog = async (log: SleepRecord) => {
  const database = await initDb();
  await database.runAsync(
    `INSERT INTO sleep_logs (id, date, sleepTime, wakeTime, quality, dreams, emoji, timezone, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [log.id, log.date, log.sleepTime, log.wakeTime, log.quality, log.dreams ?? null, log.emoji ?? null, log.timezone, log.synced ? 1 : 0]
  );
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
  await database.runAsync('DELETE FROM sleep_logs WHERE id = ?', [id]);
};

export const markLogsSyncedDb = async (ids: string[]) => {
  if (ids.length === 0) return;
  const database = await initDb();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE sleep_logs SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  );
};

// ── Settings ───────────────────────────────────────────────────
export const getSettingDb = async (key: string): Promise<string | null> => {
  const database = await initDb();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
};

export const setSettingDb = async (key: string, value: string) => {
  const database = await initDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};
