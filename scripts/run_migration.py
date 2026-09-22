import psycopg2
import os

url = "postgresql://postgres.cvylttzhqihdbkgbdewa:%25pmxSAj8BjZ7sUj@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
migration_file = "scripts/rls-migration.sql"

print(f"Executing {migration_file}...")

try:
    with open(migration_file, 'r') as f:
        sql = f.read()

    conn = psycopg2.connect(url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    cursor.execute(sql)
    
    cursor.close()
    conn.close()
    print("Migration executed successfully!")
except Exception as e:
    print(f"Error executing migration: {e}")
