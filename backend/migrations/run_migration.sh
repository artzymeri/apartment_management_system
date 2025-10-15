#!/bin/bash

# Script to run the privileged to property_manager migration
# This script will execute the database migration

echo "=========================================="
echo "Migration: privileged -> property_manager"
echo "=========================================="
echo ""
echo "This migration will:"
echo "1. Update all user roles from 'privileged' to 'property_manager'"
echo "2. Update register_requests roles"
echo "3. Modify database ENUM columns"
echo "4. Rename privileged_user_id to property_manager_user_id"
echo ""
read -p "Enter MySQL username: " MYSQL_USER
read -sp "Enter MySQL password: " MYSQL_PASS
echo ""
read -p "Enter database name [apartment_management]: " DB_NAME
DB_NAME=${DB_NAME:-apartment_management}

echo ""
echo "Running migration..."
echo ""

mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" "$DB_NAME" < complete_privileged_to_property_manager_migration.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Migration completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend server"
    echo "2. Clear your browser cache"
    echo "3. Test the application"
else
    echo ""
    echo "=========================================="
    echo "✗ Migration failed!"
    echo "=========================================="
    echo "Please check the error messages above."
    exit 1
fi

