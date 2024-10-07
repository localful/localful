-- Cleaning up existing internal if present
DROP DATABASE IF EXISTS localful;

-- Cleaning up existing user if present
DROP USER IF EXISTS localful;

-- Create localful user and internal
CREATE USER localful WITH PASSWORD 'password' LOGIN;
CREATE DATABASE localful;
GRANT CONNECT ON DATABASE localful TO localful;

-- Switch to new database
\c localful

-- Create UUID extension for uuid_generate_v4 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges to lfb user after everything is created
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO localful;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO localful;
