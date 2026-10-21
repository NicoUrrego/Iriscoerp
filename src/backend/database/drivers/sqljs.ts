import type { Database, SqlJsStatic } from 'sql.js';
import type { SqlDriver, SqlValue } from '../contracts';

/** Real SQLite compiled to WASM. Persistence is supplied by the browser adapter. */
export class SqlJsDriver implements SqlDriver {
  protected database?: Database;
  constructor(protected readonly engine: () => Promise<SqlJsStatic>, private readonly initial?: Uint8Array) {}
  async open() { if (!this.database) this.database = new (await this.engine()).Database(this.initial); await this.execute('PRAGMA foreign_keys=ON;'); }
  async query<T>(sql: string,values: SqlValue[] = []): Promise<T[]> {
    if (!this.database) throw new Error('Base SQL cerrada');
    const statement = this.database.prepare(sql);
    try { statement.bind(values); const rows: T[] = []; while(statement.step()) rows.push(statement.getAsObject() as T); return rows; }
    finally { statement.free(); }
  }
  async run(sql: string,values: SqlValue[] = []) { if (!this.database) throw new Error('Base SQL cerrada'); this.database.run(sql,values); return this.database.getRowsModified(); }
  async execute(sql: string) { if (!this.database) throw new Error('Base SQL cerrada'); this.database.exec(sql); }
  async begin() { await this.execute('BEGIN IMMEDIATE;'); }
  async commit() { await this.execute('COMMIT;'); }
  async rollback() { await this.execute('ROLLBACK;'); }
  exportBytes(): Uint8Array { if (!this.database) throw new Error('Base SQL cerrada'); return this.database.export(); }
}
