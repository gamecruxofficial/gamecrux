#!/usr/bin/env node

/**
 * Migration script to extract and sync data from Supabase backup to Neon
 *
 * Since the .backup file is a PostgreSQL custom binary format,
 * this script provides utilities for data migration.
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const neonUrl = process.env.DATABASE_URL;

if (!neonUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function getAllTablesFromNeon() {
  const client = new Client({ connectionString: neonUrl });
  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    return result.rows.map((r) => r.table_name);
  } finally {
    await client.end();
  }
}

async function getTableStructure(tableName) {
  const client = new Client({ connectionString: neonUrl });
  try {
    await client.connect();
    const result = await client.query(
      `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `,
      [tableName],
    );
    return result.rows;
  } finally {
    await client.end();
  }
}

async function verifyConnection() {
  const client = new Client({ connectionString: neonUrl });
  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Connected to Neon database successfully");
    console.log(`   Time on Neon: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Neon database");
    console.error(error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function showDatabaseStatus() {
  console.log("\n📊 Database Status Report\n");

  try {
    const tables = await getAllTablesFromNeon();
    console.log(`Found ${tables.length} tables:`);

    for (const table of tables) {
      const structure = await getTableStructure(table);
      console.log(`\n  📋 Table: ${table}`);
      structure.forEach((col) => {
        const nullable = col.is_nullable === "YES" ? "nullable" : "NOT NULL";
        const defaultVal = col.column_default
          ? ` DEFAULT ${col.column_default}`
          : "";
        console.log(
          `    • ${col.column_name}: ${col.data_type} [${nullable}${defaultVal}]`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Failed to fetch database status");
    console.error(error.message);
  }
}

async function seedSampleData() {
  const client = new Client({ connectionString: neonUrl });
  try {
    await client.connect();
    console.log("\n🌱 Seeding sample data (optional)\n");

    // Check if users table has data
    const userCheck = await client.query("SELECT COUNT(*) as count FROM users");
    if (userCheck.rows[0].count > 0) {
      console.log(
        `   Users table already has ${userCheck.rows[0].count} records. Skipping seed.`,
      );
      return;
    }

    // Sample user insert
    const sampleUser = await client.query(
      `
      INSERT INTO users (email, username, name) 
      VALUES ($1, $2, $3)
      RETURNING id, email, username;
    `,
      ["test@example.com", "testuser", "Test User"],
    );

    console.log("✅ Sample user created:");
    console.log(`   ID: ${sampleUser.rows[0].id}`);
    console.log(`   Email: ${sampleUser.rows[0].email}`);
    console.log(`   Username: ${sampleUser.rows[0].username}`);
  } catch (error) {
    console.error("❌ Failed to seed data");
    console.error(error.message);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("\n🔄 Neon Database Migration Utility\n");
  console.log(`Database: ${neonUrl.split("@")[1]?.split("/")[0] || "Neon"}\n`);

  const command = process.argv[2] || "status";

  switch (command) {
    case "verify":
      await verifyConnection();
      break;
    case "status":
      await verifyConnection();
      await showDatabaseStatus();
      break;
    case "seed":
      await seedSampleData();
      break;
    default:
      console.log("Usage:");
      console.log(
        "  node scripts/migrate-backup.js verify  - Test database connection",
      );
      console.log(
        "  node scripts/migrate-backup.js status  - Show database schema",
      );
      console.log(
        "  node scripts/migrate-backup.js seed    - Seed sample data\n",
      );
  }
}

main().catch(console.error);
