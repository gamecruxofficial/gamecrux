# Supabase to Neon Migration Guide

## ✅ Current Status

Your Neon database is **ready** with the following tables:

- **users** - 11 columns
- **subscriptions** - 19 columns
- **suggestions** - 7 columns

## 🚀 Next Steps: Importing Your Data

Since you don't have Docker or PostgreSQL CLI tools installed, here are your options:

### **Option 1: Use Neon Console (Recommended & Easiest)**

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project and database
3. Open the **SQL Editor**
4. We'll provide you with a SQL dump from your backup

### **Option 2: Convert Backup to SQL (Requires PostgreSQL Installation)**

If you have PostgreSQL installed on your system:

```bash
# Convert custom backup to SQL format
pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > backup.sql

# Then use psql to import
psql -U neondb_owner -h ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech \
     -d neondb -f backup.sql
```

### **Option 3: Node.js Data Importer (Custom Tool)**

Use the provided Node.js scripts to manage and import data.

---

## 📋 What's in Your Backup

The `db_cluster-17-09-2025@20-12-52.backup` file contains your complete database from Supabase, including:

- User accounts and profiles
- Subscription records
- Game suggestions

This is a **PostgreSQL custom format** backup that can be processed with:

1. PostgreSQL's `pg_restore` utility
2. Neon's native SQL import
3. Custom conversion scripts

---

## 🔧 Using the Migration Utilities

### Check Database Connection

```bash
DATABASE_URL="postgresql://neondb_owner:npg_E4bARCin5wcL@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require" \
node scripts/migrate-backup.js verify
```

### View Database Structure

```bash
DATABASE_URL="postgresql://neondb_owner:npg_E4bARCin5wcL@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require" \
node scripts/migrate-backup.js status
```

### Seed Sample Data (for testing)

```bash
DATABASE_URL="postgresql://neondb_owner:npg_E4bARCin5wcL@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require" \
node scripts/migrate-backup.js seed
```

---

## 🔄 Recommended Migration Path

### Step 1: Extract SQL from Backup

You have two paths:

**Path A - Install PostgreSQL (5 min setup)**

```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Then:
pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump.sql
```

**Path B - Use Online Tools**

- Upload backup to [Neon's SQL import](https://docs.neon.tech/import)
- Or use Neon console directly

### Step 2: Clean the SQL Dump

Remove Supabase-specific roles (pgsodium, supabase_admin, etc.):

```sql
-- The dump will contain. Lines like these should be removed:
-- CREATE ROLE supabase_admin;
-- CREATE ROLE pgsodium;
-- GRANT ... TO supabase_admin;
```

### Step 3: Import to Neon

```bash
psql -U neondb_owner \
     -h ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech \
     -d neondb \
     -f dump.sql
```

Or use Neon's web console to paste the SQL directly.

---

## ❓ Troubleshooting

### "pg_restore: command not found"

Install PostgreSQL from: https://www.postgresql.org/download/

### "Permission denied" errors in SQL

The backup may contain Supabase-specific roles. Remove these lines from the SQL:

- `CREATE ROLE supabase_admin;`
- `GRANT ... TO supabase_admin;`
- `CREATE SCHEMA pgsodium;`

### "Relation already exists"

Your tables are already created by Drizzle. Skip the CREATE TABLE statements in the SQL dump.

---

## 📞 Getting Help

If you encounter issues:

1. Check Neon's documentation: https://docs.neon.tech/import
2. Validate your SQL: https://www.postgresql.org/docs/current/libpq-ssl.html
3. Test connection: `node scripts/migrate-backup.js verify`

---

## ✨ What's Next

Once your data is imported:

1. **Verify Import:**

   ```bash
   DATABASE_URL="..." node scripts/migrate-backup.js status
   ```

2. **Run Your App:**

   ```bash
   npm run dev
   ```

3. **Studio for Visual DB Management:**
   ```bash
   npm run db:studio
   ```

Good luck with your migration! 🚀
