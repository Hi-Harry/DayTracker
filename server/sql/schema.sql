-- DayTracker MySQL Database Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS daystatus;
USE daystatus;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Status data table for storing user status information
CREATE TABLE IF NOT EXISTS status_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data_key VARCHAR(50) NOT NULL, -- Format: "year-month-day" (e.g., "2025-0-1")
    status_value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, data_key)
);

-- Create indexes for better performance
CREATE INDEX idx_status_data_key ON status_data(data_key);
CREATE INDEX idx_status_data_user ON status_data(user_id);
CREATE INDEX idx_users_email ON users(email);
