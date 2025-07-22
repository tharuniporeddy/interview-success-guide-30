-- First, let's check and modify the quiz_categories table structure
-- Add company and role columns
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS role TEXT;

-- Clear existing data and add new company-role structure
DELETE FROM quiz_categories;
DELETE FROM quiz_questions;

-- Insert new company and role-based categories
INSERT INTO quiz_categories (name, description, type, company, role) VALUES
-- TCS Categories
('TCS Technical', 'Technical interview questions for TCS', 'technical', 'TCS', 'Technical'),
('TCS HR', 'HR interview questions for TCS', 'hr', 'TCS', 'HR'),

-- Infosys Categories  
('Infosys Technical', 'Technical interview questions for Infosys', 'technical', 'Infosys', 'Technical'),
('Infosys HR', 'HR interview questions for Infosys', 'hr', 'Infosys', 'HR'),

-- Wipro Categories
('Wipro Technical', 'Technical interview questions for Wipro', 'technical', 'Wipro', 'Technical'),
('Wipro HR', 'HR interview questions for Wipro', 'hr', 'Wipro', 'HR'),

-- Accenture Categories
('Accenture Technical', 'Technical interview questions for Accenture', 'technical', 'Accenture', 'Technical'),
('Accenture HR', 'HR interview questions for Accenture', 'hr', 'Accenture', 'HR'),

-- General Categories
('General Technical', 'General technical interview questions', 'technical', 'General', 'Technical'),
('General HR', 'General HR interview questions', 'hr', 'General', 'HR');