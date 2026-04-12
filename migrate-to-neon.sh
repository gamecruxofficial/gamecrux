#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting migration from Supabase Backup to Neon DB..."

# 1. Ensure Supabase is initialized
if [ ! -d "supabase" ]; then
  npx supabase init
fi

# As per your docs, setting postgres version
mkdir -p supabase/.temp
echo '15.6.1.115' > supabase/.temp/postgres-version

# 2. Start local Supabase using your backup file
echo "📦 Restoring backup to local Supabase instance..."
npx supabase db start --from-backup "db_cluster-17-09-2025@20-12-52.backup"

echo "⏳ Waiting a few seconds for DB to start up completely..."
sleep 5

# 3. Extract ONLY the public schema (clean data, no Supabase roles/errors)
echo "💾 Exporting clean data (public schema without privileges or owner metadata)..."
DB_CONTAINER=$(docker ps -a -q -f "name=supabase_db")
docker exec -i $DB_CONTAINER pg_dump -U postgres -d postgres -n public --no-owner --no-privileges > clean_dump.sql

# 4. Stop local Supabase to free up resources
echo "🛑 Stopping local Supabase..."
npx supabase stop

# 5. Push extracted data to Neon DB
echo "☁️ Pushing migrated data to Neon DB..."
export NEON_URL="postgresql://neondb_owner:npg_E4bARCin5wcL@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Note: Depending on your setup, you might need psql installed locally, 
# or you can use your project's connection tools to run queries. 
# We'll use Docker's postgres image to simply push the SQL file if psql is missing.
docker run --rm -i -e PGPASSWORD="npg_E4bARCin5wcL" postgres:15 psql "postgresql://neondb_owner@ep-spring-heart-anu60e06.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require" < clean_dump.sql

echo "✅ Migration Complete! Your .env has also been updated with the Neon Database URL."
