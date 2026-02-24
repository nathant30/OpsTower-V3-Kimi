#!/bin/bash
# Database migration script for Azure PostgreSQL

set -e

# PostgreSQL configuration
DB_HOST="opstower-v2-prod-postgres.postgres.database.azure.com"
DB_NAME="opstower"
DB_USER="opstoweradmin"

# Check if password is provided as argument or environment variable
if [ -n "$1" ]; then
    DB_PASSWORD="$1"
elif [ -n "$POSTGRES_ADMIN_PASSWORD" ]; then
    DB_PASSWORD="$POSTGRES_ADMIN_PASSWORD"
else
    echo "Error: PostgreSQL password required"
    echo "Usage: $0 <password>"
    echo "Or set POSTGRES_ADMIN_PASSWORD environment variable"
    exit 1
fi

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

echo "Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "Migration completed!"
