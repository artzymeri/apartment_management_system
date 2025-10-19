#!/usr/bin/env node

/**
 * Standalone script to run migrations
 * Usage: node run_migrations.js
 */

const { connectDB } = require('./config/database');
const { runMigrations } = require('./utils/migrationRunner');

async function main() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    await runMigrations();

    console.log('Migration process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();

