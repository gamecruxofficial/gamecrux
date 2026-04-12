#!/bin/bash

# Neon Migration Setup Helper
# This script sets up environment and provides interactive migration options

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Load .env
if [ -f .env ]; then
    export $(grep DATABASE_URL .env | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║        Neon Migration Helper - Interactive Setup     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to show menu
show_menu() {
    echo ""
    echo -e "${YELLOW}What would you like to do?${NC}"
    echo -e "${CYAN}1) Verify Neon Connection${NC}"
    echo -e "${CYAN}2) Check Database Status${NC}"
    echo -e "${CYAN}3) Extract Backup to SQL${NC}"
    echo -e "${CYAN}4) Analyze Backup SQL${NC}"
    echo -e "${CYAN}5) View Import Guide${NC}"
    echo -e "${CYAN}6) Run Full Checks${NC}"
    echo -e "${CYAN}7) Install PostgreSQL Tools${NC}"
    echo -e "${CYAN}0) Exit${NC}"
    echo ""
    read -p "Enter your choice (0-7): " choice
}

# Function to check connection
check_connection() {
    echo -e "\n${CYAN}Testing Neon connection...${NC}"
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not set${NC}"
        return 1
    fi
    
    if command_exists psql; then
        if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Connected to Neon successfully!${NC}"
            return 0
        fi
    else
        # Try with Node.js
        node scripts/migrate-backup.js verify
        return 0
    fi
}

# Function for backup extraction
extract_backup() {
    echo -e "\n${CYAN}Extracting backup to SQL...${NC}"
    
    if ! command_exists pg_restore; then
        echo -e "${RED}❌ pg_restore not found${NC}"
        echo -e "${YELLOW}PostgreSQL must be installed: https://www.postgresql.org/download/${NC}"
        return 1
    fi
    
    if [ ! -f "db_cluster-17-09-2025@20-12-52.backup" ]; then
        echo -e "${RED}❌ Backup file not found${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Converting backup format...${NC}"
    pg_restore --format=plain db_cluster-17-09-2025@20-12-52.backup > dump_from_backup.sql
    
    if [ -f "dump_from_backup.sql" ]; then
        SIZE=$(ls -lh dump_from_backup.sql | awk '{print $5}')
        LINES=$(wc -l < dump_from_backup.sql)
        echo -e "${GREEN}✅ Backup extracted!${NC}"
        echo -e "   File: dump_from_backup.sql (${SIZE}, ${LINES} lines)"
    fi
}

# Interactive menu
while true; do
    show_menu
    
    case $choice in
        1)
            check_connection
            ;;
        2)
            node scripts/migrate-backup.js status
            ;;
        3)
            extract_backup
            ;;
        4)
            node scripts/advanced-migrate.js analyze
            ;;
        5)
            node scripts/advanced-migrate.js guide
            ;;
        6)
            node scripts/advanced-migrate.js full
            ;;
        7)
            echo -e "\n${CYAN}PostgreSQL Installation Instructions${NC}"
            echo -e "${YELLOW}Windows:${NC}"
            echo "  1. Download from: https://www.postgresql.org/download/windows/"
            echo "  2. Run installer and follow prompts"
            echo "  3. Ensure 'pgAdmin' and command-line tools are selected"
            echo ""
            echo -e "${YELLOW}macOS (with Homebrew):${NC}"
            echo "  brew install postgresql"
            echo ""
            echo -e "${YELLOW}Linux (Ubuntu/Debian):${NC}"
            echo "  sudo apt-get install postgresql-client"
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done
