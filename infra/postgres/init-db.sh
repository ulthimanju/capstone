#!/bin/bash
set -e

# Create all 11 service databases
databases=(
  "db_auth"
  "db_user"
  "db_notebook"
  "db_quiz"
  "db_flashcard"
  "db_course"
  "db_assignment"
  "db_practice"
  "db_gamification"
  "db_analytics"
  "db_notification"
)

for db in "${databases[@]}"; do
    echo "Creating service database: $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE DATABASE $db;
EOSQL
done

echo "Databases created successfully. Applying schemas..."

# Connect individually to apply their respective schema DDLs
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_auth -f /tmp/schema-mounts/auth_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_user -f /tmp/schema-mounts/user_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_notebook -f /tmp/schema-mounts/notebook_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_quiz -f /tmp/schema-mounts/quiz_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_flashcard -f /tmp/schema-mounts/flashcard_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_course -f /tmp/schema-mounts/course_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_assignment -f /tmp/schema-mounts/assignment_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_practice -f /tmp/schema-mounts/practice_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_gamification -f /tmp/schema-mounts/gamification_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_analytics -f /tmp/schema-mounts/analytics_schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d db_notification -f /tmp/schema-mounts/notification_schema.sql

echo "All schemas loaded successfully."
