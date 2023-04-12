-- Cleaning up existing internal if present
DROP DATABASE IF EXISTS lfb;

-- Cleaning up existing user if present
DROP USER IF EXISTS lfb;

-- Create lfb user and internal
CREATE USER lfb WITH PASSWORD 'password' LOGIN;
CREATE DATABASE lfb;
GRANT CONNECT ON DATABASE lfb TO lfb;

-- Switch to new internal
\c lfb

-- Create UUID extension for uuid_generate_v4 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Functions for automatically managing created_at and updated_at timestamps
CREATE OR REPLACE FUNCTION update_table_timestamps()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';


/**
    Profiles Table
    -----------
    Used to store user profiles.
 */
CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(100) NOT NULL UNIQUE,
    encryption_secret VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id)
);
CREATE TRIGGER update_profile_timestamps BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_table_timestamps();

/**
    Changes Table
    -----------
    Used to store all the changes that users make to their content.
 */
CREATE TABLE IF NOT EXISTS changes (
    id VARCHAR(100) NOT NULL UNIQUE,
    data TEXT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

-- Grant privileges to lfb user after everything is created
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lfb;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lfb;
