export type SqlValue = string | number | null | Uint8Array;
export interface SqlExecutor {
  query<T>(sql: string, values?: SqlValue[]): Promise<T[]>;
  run(sql: string, values?: SqlValue[]): Promise<number>;
  execute(sql: string): Promise<void>;
}
export interface SqlDriver extends SqlExecutor {
  open(): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  /** Web driver reloads the last persisted SQLite image under its lock. */
  refresh?(): Promise<void>;
  persist?(): Promise<void>;
  exclusive?<T>(work: () => Promise<T>): Promise<T>;
}
export interface Migration { version: number; sql: string }
