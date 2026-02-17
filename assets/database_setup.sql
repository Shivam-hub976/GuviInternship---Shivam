-- Guvi Internship Authentication System - Database Setup Script
-- This script creates the MySQL database and tables required for the application

-- Create Database
CREATE DATABASE IF NOT EXISTS guvi_login;
USE guvi_login;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index on email for faster lookups
CREATE INDEX idx_email ON users(email);

-- Display tables created
SHOW TABLES;

-- Display table structure
DESCRIBE users;
