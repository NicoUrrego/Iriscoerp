import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { SqlDriver, SqlValue } from '../contracts';

export class NativeSqliteDriver implements SqlDriver {
  private connection?: Promise<SQLiteDBConnection>;
  private async db() {
    return this.connection ??= (async () => {
      const manager = new SQLiteConnection(CapacitorSQLite);
      const consistent = await manager.checkConnectionsConsistency();
      const exists = await manager.isConnection('iris_erp',false);
      const db = consistent.result && exists.result ? await manager.retrieveConnection('iris_erp',false) : await manager.createConnection('iris_erp',false,'no-encryption',1,false);
      await db.open();
      await db.execute('PRAGMA foreign_keys=ON;',false);
      return db;
    })().catch(error=>{this.connection=undefined;throw error;});
  }
  async open() { await this.db(); }
  async query<T>(sql: string,values: SqlValue[] = []) { return (await (await this.db()).query(sql,values)).values as T[] ?? []; }
  async run(sql: string,values: SqlValue[] = []) { return (await (await this.db()).run(sql,values,false)).changes?.changes ?? 0; }
  async execute(sql: string) { await (await this.db()).execute(sql,false); }
  async begin() { await (await this.db()).beginTransaction(); }
  async commit() { await (await this.db()).commitTransaction(); }
  async rollback() { await (await this.db()).rollbackTransaction(); }
}
