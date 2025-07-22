-- Create quiz categories table
CREATE TABLE public.quiz_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('role', 'company')), -- role-based or company-based
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.quiz_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table to track user quiz sessions
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.quiz_categories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz answers table to track individual question responses
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_answer TEXT CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tips table
CREATE TABLE public.interview_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hr', 'technical', 'behavioral', 'resume', 'body_language'
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video tutorials table
CREATE TABLE public.video_tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL, -- 'technical', 'hr', 'communication', 'general'
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_categories (public read access)
CREATE POLICY "Anyone can view quiz categories" 
ON public.quiz_categories 
FOR SELECT 
USING (true);

-- RLS Policies for quiz_questions (public read access)
CREATE POLICY "Anyone can view quiz questions" 
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

CREATE POLICY "Users can update their own quiz attempts" 
ON public.quiz_attempts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for quiz_answers (user-specific via attempt)
CREATE POLICY "Users can view their own quiz answers" 
ON public.quiz_answers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts 
    WHERE quiz_attempts.id = quiz_answers.attempt_id 
    AND quiz_attempts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own quiz answers" 
ON public.quiz_answers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts 
    WHERE quiz_attempts.id = quiz_answers.attempt_id 
    AND quiz_attempts.user_id = auth.uid()
  )
);

-- RLS Policies for interview_tips (public read access)
CREATE POLICY "Anyone can view interview tips" 
ON public.interview_tips 
FOR SELECT 
USING (true);

-- RLS Policies for video_tutorials (public read access)
CREATE POLICY "Anyone can view video tutorials" 
ON public.video_tutorials 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_quiz_questions_category ON public.quiz_questions(category_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_category ON public.quiz_attempts(category_id);
CREATE INDEX idx_quiz_answers_attempt ON public.quiz_answers(attempt_id);
CREATE INDEX idx_quiz_answers_question ON public.quiz_answers(question_id);
CREATE INDEX idx_interview_tips_category ON public.interview_tips(category);
CREATE INDEX idx_video_tutorials_category ON public.video_tutorials(category);

-- Create triggers for updated_at columns
CREATE TRIGGER update_quiz_categories_updated_at
BEFORE UPDATE ON public.quiz_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_tips_updated_at
BEFORE UPDATE ON public.interview_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_tutorials_updated_at
BEFORE UPDATE ON public.video_tutorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample quiz categories
INSERT INTO public.quiz_categories (name, description, type) VALUES
('Technical Interview', 'Programming, algorithms, and technical concepts', 'role'),
('HR Interview', 'Human resources and behavioral questions', 'role'),
('Medical Interview', 'Healthcare and medical field questions', 'role'),
('Finance Interview', 'Banking, finance, and accounting questions', 'role'),
('TCS', 'Tata Consultancy Services specific questions', 'company'),
('Infosys', 'Infosys specific interview questions', 'company'),
('Wipro', 'Wipro company-specific questions', 'company'),
('Accenture', 'Accenture interview preparation', 'company');

-- Insert sample interview tips
INSERT INTO public.interview_tips (title, content, category, tags) VALUES
('Dress Code for Interviews', 'Always dress professionally. For corporate roles, opt for formal business attire. Research the company culture beforehand.', 'general', ARRAY['appearance', 'professionalism']),
('STAR Method for Behavioral Questions', 'Use the STAR method: Situation, Task, Action, Result. This framework helps structure your answers to behavioral questions effectively.', 'behavioral', ARRAY['framework', 'storytelling']),
('Technical Interview Preparation', 'Practice coding problems daily, understand data structures and algorithms, and be prepared to write code on a whiteboard or computer.', 'technical', ARRAY['coding', 'algorithms']),
('Body Language Tips', 'Maintain eye contact, sit up straight, offer a firm handshake, and smile genuinely. Your body language speaks volumes.', 'general', ARRAY['confidence', 'communication']),
('Research the Company', 'Study the company''s mission, values, recent news, and the role you''re applying for. Show genuine interest and enthusiasm.', 'preparation', ARRAY['research', 'company']);

-- Insert sample video tutorials
INSERT INTO public.video_tutorials (title, description, youtube_url, category, duration_minutes) VALUES
('Top 10 Interview Questions and Answers', 'Learn how to answer the most common interview questions with confidence', 'https://www.youtube.com/watch?v=naIkpQ_cItA', 'general', 15),
('Technical Interview Tips for Software Engineers', 'Comprehensive guide for acing technical interviews in software engineering', 'https://www.youtube.com/watch?v=FB_bw2bEpEE', 'technical', 25),
('Body Language in Interviews', 'Master the art of non-verbal communication during interviews', 'https://www.youtube.com/watch?v=vNwjlg3F3xQ', 'communication', 12),
('How to Answer "Tell Me About Yourself"', 'Perfect your elevator pitch and make a great first impression', 'https://www.youtube.com/watch?v=kayOhGRcNt4', 'general', 8);