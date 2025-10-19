import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from '../src/config';
import logger from '../src/utils/logger';

const runMigrations = async () => {
  try {
    const supabase = createClient(config.database.url, config.database.serviceRoleKey);

    // Read migration files
    const migrationDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql') && file !== 'run-migrations.ts')
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      logger.info(`Running migration: ${file}`);

      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
          
          if (error) {
            logger.error(`Migration ${file} failed at statement:`, statement);
            throw error;
          }
        }
      }

      logger.info(`Migration ${file} completed successfully`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();