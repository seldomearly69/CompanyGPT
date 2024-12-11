-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;
drop table if exists users;
drop table if exists chats;

-- Create the users table
CREATE TABLE users (
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL primary KEY,
    password_hash VARCHAR(255) NOT null,
    role VARCHAR(10) not null default 'user'
);

-- Create the chats table
CREATE TABLE chats (
    chat_id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    user_email VARCHAR(100) NOT null,
    messages TEXT[] not NULL
);

-- Insert a user with a hashed password
INSERT INTO users (username, email, password_hash, role) 
VALUES (
    'Admin', 
    'admin@company.com.sg', 
    encode(digest('P@ssw0rd', 'sha256'), 'hex'),
    'admin'
),(
	'test1',
	'test1@company.com.sg',
	encode(digest('P@ssw0rd', 'sha256'), 'hex'),
	'user'
);
