#!/bin/bash

# Script to run the property_managers migration
# This creates the junction table for many-to-many property-manager relationships

echo "🔄 Running property_managers migration..."

# Load database credentials from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "❌ Error: .env file not found!"
  exit 1
fi

# Check if required variables are set
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ]; then
  echo "❌ Error: Database credentials not found in .env file!"
  exit 1
fi

# Run the migration
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < migrations/create_property_managers_table.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
  echo "📊 The property_managers table has been created."
  echo "📦 Existing single manager assignments have been migrated to the new table."
else
  echo "❌ Migration failed!"
  exit 1
fi

