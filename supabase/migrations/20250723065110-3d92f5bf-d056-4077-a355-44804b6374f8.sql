-- Create quiz_categories table
CREATE TABLE public.quiz_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_answers table
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL,
  question_id UUID NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_categories (public read)
CREATE POLICY "Quiz categories are viewable by everyone" 
ON public.quiz_categories 
FOR SELECT 
USING (true);

-- RLS Policies for quiz_questions (public read)
CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- RLS Policies for quiz_attempts (user-specific)
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quiz_answers (user-specific through attempt)
CREATE POLICY "Users can view their own quiz answers" 
ON public.quiz_answers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM quiz_attempts 
  WHERE quiz_attempts.id = quiz_answers.attempt_id 
  AND quiz_attempts.user_id = auth.uid()
));

CREATE POLICY "Users can create their own quiz answers" 
ON public.quiz_answers 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM quiz_attempts 
  WHERE quiz_attempts.id = quiz_answers.attempt_id 
  AND quiz_attempts.user_id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE quiz_questions ADD CONSTRAINT fk_quiz_questions_category 
FOREIGN KEY (category_id) REFERENCES quiz_categories(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts ADD CONSTRAINT fk_quiz_attempts_category 
FOREIGN KEY (category_id) REFERENCES quiz_categories(id) ON DELETE CASCADE;

ALTER TABLE quiz_answers ADD CONSTRAINT fk_quiz_answers_attempt 
FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;

ALTER TABLE quiz_answers ADD CONSTRAINT fk_quiz_answers_question 
FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_quiz_categories_updated_at
BEFORE UPDATE ON public.quiz_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_attempts_updated_at
BEFORE UPDATE ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
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