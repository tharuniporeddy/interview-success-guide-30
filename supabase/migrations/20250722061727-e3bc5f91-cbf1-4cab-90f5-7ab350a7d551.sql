-- Update quiz categories to support company and role structure
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS role TEXT;

-- Update existing categories to new structure
UPDATE quiz_categories SET 
  company = CASE 
    WHEN name ILIKE '%TCS%' THEN 'TCS'
    WHEN name ILIKE '%Infosys%' THEN 'Infosys'
    WHEN name ILIKE '%Wipro%' THEN 'Wipro'
    WHEN name ILIKE '%Accenture%' THEN 'Accenture'
    ELSE 'General'
  END,
  role = CASE 
    WHEN type = 'technical' THEN 'Technical'
    WHEN type = 'hr' THEN 'HR'
    ELSE 'General'
  END;

-- Clear existing data and add new company-role structure
DELETE FROM quiz_categories;

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

-- Insert sample questions for each category
INSERT INTO quiz_questions (category_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) 
SELECT 
  c.id,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'What is the full form of TCS?'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'Why do you want to work at TCS?'
    WHEN c.company = 'Infosys' AND c.role = 'Technical' THEN 'What programming languages are you proficient in?'
    WHEN c.company = 'Infosys' AND c.role = 'HR' THEN 'Describe your ideal work environment at Infosys.'
    ELSE 'What is your greatest strength?'
  END,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'Tata Consultancy Services'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'Because of career growth opportunities'
    ELSE 'Java'
  END,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'Total Computer Solutions'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'Because of high salary'
    ELSE 'Python'
  END,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'Technology Computer Systems'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'Because it''s a famous company'
    ELSE 'JavaScript'
  END,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'Tera Computer Services'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'Because of work-life balance'
    ELSE 'C++'
  END,
  CASE 
    WHEN c.company = 'TCS' AND c.role = 'Technical' THEN 'A'
    WHEN c.company = 'TCS' AND c.role = 'HR' THEN 'A'
    ELSE 'A'
  END,
  'medium'
FROM quiz_categories c;