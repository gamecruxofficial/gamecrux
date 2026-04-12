#!/usr/bin/env node

/**
 * Advanced Migration Utility for Supabase → Neon
 * This utility helps manage backup extraction and data import
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const neonUrl = process.env.DATABASE_URL;
const backupFile = "./db_cluster-17-09-2025@20-12-52.backup";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function log_section(title) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(title, "cyan");
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

async function checkBackupFile() {
  if (!fs.existsSync(backupFile)) {
    log(`❌ Backup file not found: ${backupFile}`, "red");
    log("Expected location: " + path.resolve(backupFile), "yellow");
    return false;
  }

  const stats = fs.statSync(backupFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  log(`✅ Backup file found`, "green");
  log(`   Path: ${backupFile}`, "cyan");
  log(`   Size: ${sizeMB} MB`, "cyan");
  return true;
}

async function checkPostgresTools() {
  return new Promise((resolve) => {
    const testCmd = process.platform === "win32" ? "where" : "which";
    const tool = process.platform === "win32" ? "pg_restore" : "pg_restore";

    const proc = spawn(testCmd, [tool]);

    proc.on("close", (code) => {
      if (code === 0) {
        log("✅ PostgreSQL tools found (pg_restore available)", "green");
        resolve(true);
      } else {
        log("⚠️  PostgreSQL tools not found", "yellow");
        log("   Install from: https://www.postgresql.org/download/", "yellow");
        resolve(false);
      }
    });
  });
}

async function extractBackupToSQL() {
  log_section("Backup Extraction");

  const hasTools = await checkPostgresTools();
  const hasBackup = await checkBackupFile();

  if (!hasBackup) return false;

  if (!hasTools) {
    log("\n📝 Without pg_restore, use these alternatives:", "yellow");
    log(
      "   1. Install PostgreSQL: https://www.postgresql.org/download/windows/",
      "yellow",
    );
    log(
      "   2. Then run: pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump.sql",
      "yellow",
    );
    log("   3. Import to Neon via console or: psql ... -f dump.sql", "yellow");
    return false;
  }

  return new Promise((resolve) => {
    const outputFile = "./dump_from_backup.sql";
    const writeStream = fs.createWriteStream(outputFile);

    log("🔄 Extracting backup to SQL format...", "cyan");
    const proc = spawn("pg_restore", ["--format=plain", backupFile]);

    let errorOutput = "";

    proc.stdout.pipe(writeStream);

    proc.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        const stats = fs.statSync(outputFile);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        log(`✅ Backup extracted successfully!`, "green");
        log(`   Output: ${outputFile}`, "cyan");
        log(`   Size: ${sizeMB} MB`, "cyan");

        // Count lines
        const lineCount = fs
          .readFileSync(outputFile, "utf-8")
          .split("\n").length;
        log(`   Lines: ${lineCount}`, "cyan");

        resolve(true);
      } else {
        log(`❌ Extraction failed`, "red");
        if (errorOutput) log(`Error: ${errorOutput.substring(0, 200)}`, "red");
        resolve(false);
      }
    });
  });
}

async function analyzeSQL(filePath) {
  log_section("SQL Analysis");

  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`, "red");
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Count SQL statements
  const createCount = (content.match(/CREATE TABLE/gi) || []).length;
  const insertCount = (content.match(/INSERT INTO/gi) || []).length;
  const supabaseRoles = (
    content.match(/supabase_admin|pgsodium|pg_net|supabase_/gi) || []
  ).length;

  log(`📊 Analysis Results:`, "cyan");
  log(`   Total lines: ${lines.length}`, "cyan");
  log(`   CREATE TABLE statements: ${createCount}`, "cyan");
  log(`   INSERT statements: ${insertCount}`, "cyan");
  log(`   Supabase-specific items found: ${supabaseRoles}`, "yellow");

  if (supabaseRoles > 0) {
    log(
      `\n⚠️  This dump contains Supabase-specific roles that won't work on Neon.`,
      "yellow",
    );
    log(`   They should be removed before importing.`, "yellow");
  }
}

async function getTableDataCount() {
  if (!neonUrl) {
    log("DATABASE_URL not set", "red");
    return;
  }

  const client = new Client({ connectionString: neonUrl });

  try {
    await client.connect();
    log_section("Current Data in Neon");

    const tables = ["users", "subscriptions", "suggestions"];

    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM ${table}`,
      );
      const count = result.rows[0].count;
      log(`   ${table}: ${count} records`, "cyan");
    }
  } catch (error) {
    log(`❌ Failed to connect: ${error.message}`, "red");
  } finally {
    await client.end();
  }
}

async function showImportGuide() {
  log_section("Import Guide for Neon");

  log("Option 1: Using Neon Console", "green");
  log("  1. Go to https://console.neon.tech", "cyan");
  log("  2. Select your project", "cyan");
  log("  3. Open SQL Editor tab", "cyan");
  log("  4. Paste cleaned SQL and execute", "cyan");

  console.log("");

  log("Option 2: Using psql (if installed)", "green");
  log("  psql -U neondb_owner \\", "cyan");
  log(
    "       -h ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech \\",
    "cyan",
  );
  log("       -d neondb \\", "cyan");
  log("       -f cleaned_dump.sql", "cyan");

  console.log("");

  log("Option 3: Using npm + Node.js", "green");
  log("  Create a Node.js script with pg library for bulk insert", "cyan");
}

async function main() {
  console.clear();
  log("╔═══════════════════════════════════════════════╗", "yellow");
  log("║  Supabase → Neon Database Migration Utility   ║", "yellow");
  log("╚═══════════════════════════════════════════════╝", "yellow");

  const command = process.argv[2] || "help";

  switch (command) {
    case "extract":
      await extractBackupToSQL();
      break;
    case "analyze":
      const sqlFile = process.argv[3] || "./dump_from_backup.sql";
      await analyzeSQL(sqlFile);
      break;
    case "status":
      await getTableDataCount();
      break;
    case "guide":
      await showImportGuide();
      break;
    case "full":
      await checkBackupFile();
      await checkPostgresTools();
      await getTableDataCount();
      await showImportGuide();
      break;
    case "help":
    default:
      log_section("Available Commands");
      log("Usage: node scripts/advanced-migrate.js <command>\n", "cyan");

      log("Commands:", "green");
      log("  extract    - Extract backup to SQL format", "cyan");
      log("  analyze    - Analyze extracted SQL dump", "cyan");
      log("  status     - Check current data in Neon", "cyan");
      log("  guide      - Show import guide", "cyan");
      log("  full       - Run all checks", "cyan");
      log("  help       - Show this help\n", "cyan");

      log("Examples:", "green");
      log("  node scripts/advanced-migrate.js extract", "cyan");
      log(
        "  node scripts/advanced-migrate.js analyze dump_from_backup.sql",
        "cyan",
      );
      log("  node scripts/advanced-migrate.js status", "cyan");
  }
}

main().catch((err) => {
  log(`\n❌ Error: ${err.message}`, "red");
  process.exit(1);
});
