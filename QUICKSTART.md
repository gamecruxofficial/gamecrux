# ⚡ Quick Start: Neon Migration

## Current Status ✅

```
✅ Neon database deployed with schema
✅ 3 tables ready (users, subscriptions, suggestions)
✅ Connection verified
✅ npm scripts working
⏳ Data waiting to be imported
```

---

## 🚀 Next: Import Your Data (3 Options)

### **Option 1: Fastest (No Installation)**

Use Neon's web console with our Node.js converter:

```bash
# First, try to extract (requires PostgreSQL)
npm run migrate:extract
```

If that fails, go to Option 2.

---

### **Option 2: Install PostgreSQL (5 mins, Recommended)**

#### Windows:

1. Download: https://www.postgresql.org/download/windows/
2. Run installer, select "Command Line Tools"
3. Verify installation:
   ```bash
   pg_restore --version
   ```
4. Extract your backup:
   ```bash
   pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump.sql
   ```

#### macOS:

```bash
brew install postgresql
pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump.sql
```

#### Linux (Ubuntu):

```bash
sudo apt-get install postgresql-client
pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump.sql
```

---

### **Option 3: Neon Console (No Command Line)**

After getting dump.sql:

1. Go to https://console.neon.tech
2. Select your project
3. Open **SQL Editor**
4. Create a new query
5. Open `dump.sql` in a text editor
6. **Remove these lines from the SQL** (Supabase-specific):
   ```sql
   CREATE ROLE supabase_admin;
   CREATE ROLE pgsodium;
   CREATE SCHEMA pgsodium;
   ```
7. Paste cleaned SQL into editor
8. Click **Run**

---

## 📋 What These Files Do

| File                          | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `scripts/migrate-backup.js`   | Check connection & database status |
| `scripts/advanced-migrate.js` | Extract & analyze backup           |
| `scripts/migrate.sh`          | Interactive helper (bash)          |
| `NEON_SETUP_SUMMARY.md`       | Complete setup guide               |
| `MIGRATION_GUIDE.md`          | Detailed troubleshooting           |

---

## 🔧 Available Commands

```bash
# Check if Neon connection works
npm run migrate:verify

# View database schema
npm run migrate:status

# Seed sample test data
npm run migrate:seed

# Show migration help
npm run migrate:help

# Try to extract backup (needs PostgreSQL)
npm run migrate:extract

# Analyze extracted SQL
npm run migrate:analyze

# Full diagnostics
npm run migrate:full
```

---

## ✨ After Data Import

Once data is imported:

```bash
# Test your app
npm run dev

# Visual database management
npm run db:studio

# Generate new migrations
npm run db:generate
```

---

## 🆘 Common Issues & Fixes

| Issue                             | Solution                               |
| --------------------------------- | -------------------------------------- |
| "pg_restore not found"            | Install PostgreSQL (see Option 2)      |
| "Permission denied" errors in SQL | Remove Supabase role lines (see above) |
| "Relation already exists"         | Skip CREATE TABLE lines in SQL dump    |
| "Unknown user supabase_admin"     | Remove all supabase\_\* lines from SQL |

---

## 💡 Pro Tips

1. **Test First**: Import a small SQL file first to test the process
2. **Keep Backup**: Don't delete dump.sql until you confirm all data is there
3. **Verify Data**: After import, run `npm run migrate:status` to see row counts
4. **Use Drizzle Studio**: `npm run db:studio` for visual management

---

## 📚 Need More Details?

- Full setup: See [NEON_SETUP_SUMMARY.md](NEON_SETUP_SUMMARY.md)
- Troubleshooting: See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- Neon Docs: https://docs.neon.tech
- PostgreSQL: https://www.postgresql.org/docs/

---

## 🎯 You Are Here

```
[Supabase] → [Backup Downloaded] → [Schema Deployed] ← YOU ARE HERE
                                  ↓
                          [Data Imported]
                                  ↓
                            [App Running]
```

**Next Step:** Choose Option 1, 2, or 3 above to import your data! 🚀
