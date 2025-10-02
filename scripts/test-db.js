#!/usr/bin/env node

/**
 * Test PostgreSQL database connection
 *
 * Usage:
 *   node scripts/test-db.js
 *   npm run test:db
 */

import pg from 'pg';

const DATABASE_CONFIG = {
  host: '147.139.241.73',
  port: 5432,
  user: 'postgres',
  password: '-Kambing12345',
  database: 'postgres', // Connect to default postgres database first
};

async function testConnection() {
  console.log('=== PostgreSQL Connection Test ===');
  console.log();
  console.log(`Host: ${DATABASE_CONFIG.host}`);
  console.log(`Port: ${DATABASE_CONFIG.port}`);
  console.log(`User: ${DATABASE_CONFIG.user}`);
  console.log();

  const client = new pg.Client(DATABASE_CONFIG);

  try {
    // Test connection
    console.log('Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✓ Connection successful!');
    console.log();

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL Version:');
    console.log(versionResult.rows[0].version);
    console.log();

    // List all databases
    console.log('Available databases:');
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
    );
    dbResult.rows.forEach((row) => {
      const marker = row.datname === 'sena_rencar' ? ' ✓ (READY)' : '';
      console.log(`  - ${row.datname}${marker}`);
    });
    console.log();

    // Check if sena_rencar exists
    const senaRencarExists = dbResult.rows.some((row) => row.datname === 'sena_rencar');

    if (senaRencarExists) {
      console.log('✓ Database "sena_rencar" found!');
      console.log();

      // Test connection to sena_rencar database
      await client.end();

      const senaClient = new pg.Client({
        ...DATABASE_CONFIG,
        database: 'sena_rencar'
      });

      await senaClient.connect();
      console.log('✓ Successfully connected to sena_rencar database');
      console.log();

      // Check tables
      const tablesResult = await senaClient.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public'
         ORDER BY table_name`
      );

      if (tablesResult.rows.length > 0) {
        console.log('Existing tables:');
        tablesResult.rows.forEach((row) => {
          console.log(`  - ${row.table_name}`);
        });
      } else {
        console.log('No tables found (database is empty - will be created on first run)');
      }
      console.log();

      await senaClient.end();

      console.log('=== DATABASE_URL ===');
      console.log('postgresql://postgres:-Kambing12345@147.139.241.73:5432/sena_rencar');
      console.log();
      console.log('✓ Database is ready for deployment!');
    } else {
      console.log('⚠ Database "sena_rencar" not found!');
      console.log();
      console.log('Creating database "sena_rencar"...');

      await client.query('CREATE DATABASE sena_rencar');
      console.log('✓ Database "sena_rencar" created successfully!');
      console.log();
      console.log('=== DATABASE_URL ===');
      console.log('postgresql://postgres:-Kambing12345@147.139.241.73:5432/sena_rencar');
      console.log();
      console.log('✓ Database is ready for deployment!');
    }

    console.log();
    console.log('=== Next Steps ===');
    console.log('1. Copy the DATABASE_URL above');
    console.log('2. Add to GitHub Secrets as "DATABASE_URL"');
    console.log('3. Run: npm run dev (to test locally)');
    console.log('4. Run: git push origin main (to deploy to Cloud Run)');

  } catch (error) {
    console.error('✗ Connection failed!');
    console.error();
    console.error('Error:', error.message);
    console.error();
    console.error('Troubleshooting:');
    console.error('1. Check if PostgreSQL server is running');
    console.error('2. Verify firewall allows connections from your IP');
    console.error('3. Confirm credentials are correct');
    console.error('4. Check if server allows remote connections');
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        // Ignore
      }
    }
  }
}

// Run test
testConnection().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
