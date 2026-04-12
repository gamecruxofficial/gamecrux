#!/usr/bin/env node

/**
 * Direct data importer - Reads COPY statements and inserts data from backup
 */

const { Client } = require("pg");
const fs = require("fs");
const readline = require("readline");

const neonUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_E4bARCin5wcL@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function checkRowCounts() {
  const client = new Client({ connectionString: neonUrl });
  try {
    await client.connect();

    const tables = ["users", "subscriptions", "suggestions"];
    console.log("\n📊 Current Row Counts:\n");

    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM public.${table}`,
      );
      const count = result.rows[0].count;
      console.log(`  ${table}: ${count} records`);
    }

    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function importDataFromBackup() {
  const backupFile = "./db_cluster-17-09-2025@20-12-52.backup";

  if (!fs.existsSync(backupFile)) {
    console.error("❌ Backup file not found:", backupFile);
    return false;
  }

  const client = new Client({ connectionString: neonUrl });

  try {
    await client.connect();
    console.log("\n🔄 Starting data import from backup...\n");

    const content = fs.readFileSync(backupFile, "utf-8");
    const lines = content.split("\n");

    // First pass: collect all data sections
    let inCopy = false;
    let currentTable = null;
    let rowBuffer = [];
    let copyColumns = [];
    const tableData = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Start of COPY for public tables
      if (line.startsWith("COPY public.")) {
        inCopy = true;
        const match = line.match(/COPY public\.(\w+)/);
        if (match) {
          currentTable = match[1];
          // Parse column list
          const colMatch = line.match(/\((.*?)\)/);
          if (colMatch) {
            copyColumns = colMatch[1]
              .split(",")
              .map((col) => col.trim().replace(/"/g, ""));
          }
          tableData[currentTable] = { columns: copyColumns, rows: [] };
        }
        continue;
      }

      // End of COPY block
      if (inCopy && line === "\\.") {
        inCopy = false;
        rowBuffer = [];
        currentTable = null;
        copyColumns = [];
        continue;
      }

      // Collect data rows
      if (inCopy && currentTable && line && !line.startsWith("--")) {
        if (tableData[currentTable]) {
          tableData[currentTable].rows.push(line);
        }
      }
    }

    // Second pass: import in correct order (foreign key dependencies)
    const importOrder = ["users", "suggestions", "subscriptions"];
    for (const table of importOrder) {
      if (tableData[table] && tableData[table].rows.length > 0) {
        const data = tableData[table];
        console.log(`📥 Processing ${table}...`);
        await insertRows(client, table, data.columns, data.rows);
        console.log(`   ✅ Inserted ${data.rows.length} records into ${table}`);
      }
    }

    console.log("\n✅ Data import complete!\n");
    return true;
  } catch (error) {
    console.error("❌ Import error:", error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function insertRows(client, table, columns, rows) {
  for (const row of rows) {
    const values = parseCopyRow(row);

    // Build INSERT statement
    const placeholders = values.map((_, i) => `$${i + 1}`).join(",");
    const cols = columns.join(",");
    const query = `INSERT INTO public.${table} (${cols}) VALUES (${placeholders})`;

    try {
      await client.query(query, values);
    } catch (error) {
      if (!error.message.includes("duplicate")) {
        console.error(`   Warning: Could not insert row: ${error.message}`);
      }
    }
  }
}

function parseCopyRow(line) {
  // Handle tab-separated values with PostgreSQL NULL representation (\N)
  const parts = line.split("\t");
  return parts.map((part) => {
    if (part === "\\N") return null;
    if (part === "\\N ") return null;
    return part.trim();
  });
}

async function main() {
  console.log("\n🔍 Neon Data Import Tool\n");

  await checkRowCounts();

  const command = process.argv[2] || "import";

  if (command === "import") {
    const success = await importDataFromBackup();
    if (success) {
      console.log("\n⏳ Verifying import...\n");
      await checkRowCounts();
    }
  }
}

main().catch(console.error);
