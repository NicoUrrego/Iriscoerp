import type { Migration, SqlDriver, SqlExecutor } from './contracts';

/** All statements in a business operation share a transaction and one queue. */
export class SqlDatabase {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly driver: SqlDriver, private readonly migrations: Migration[]) {}
  transaction<T>(work: (sql: SqlExecutor) => Promise<T>): Promise<T> {
    const task = async () => {
      await this.driver.open();
      const operation = async () => {
        await this.driver.refresh?.();
        await this.driver.begin();
        try {
          await this.driver.execute('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
          const rows = await this.driver.query<{version:number}>('SELECT version FROM schema_migrations ORDER BY version');
          if (rows.some(r=>!this.migrations.some(m=>m.version===r.version))) throw new Error('La base requiere una versión más reciente de Iris');
          for (const migration of this.migrations) {
            if (!rows.some(r=>r.version===migration.version)) {
              await this.driver.execute(migration.sql);
              await this.driver.run('INSERT INTO schema_migrations VALUES (?,?)',[migration.version,new Date().toISOString()]);
            }
          }
          const result = await work(this.driver);
          await this.driver.commit();
          await this.driver.persist?.();
          return result;
        } catch (error) {
          try { await this.driver.rollback(); } catch { /* Commit may have completed before a persistence failure. */ }
          throw error;
        }
      };
      return this.driver.exclusive ? this.driver.exclusive(operation) : operation();
    };
    const result = this.queue.then(task,task);
    this.queue = result.catch(()=>undefined);
    return result;
  }
}
