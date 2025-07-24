-- Create interview_tips table
CREATE TABLE public.interview_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for interview_tips
ALTER TABLE public.interview_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for interview_tips
CREATE POLICY "Interview tips are viewable by everyone" 
ON public.interview_tips 
FOR SELECT 
USING (true);

-- Create video_tutorials table
CREATE TABLE public.video_tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for video_tutorials
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Create policies for video_tutorials
CREATE POLICY "Video tutorials are viewable by everyone" 
ON public.video_tutorials 
FOR SELECT 
USING (true);

-- Insert sample interview tips
INSERT INTO public.interview_tips (title, content, category, tags) VALUES
('STAR Method for Behavioral Questions', 'Use the STAR method: Situation, Task, Action, Result. This helps structure your answers to behavioral questions clearly and effectively.', 'behavioral', ARRAY['star-method', 'behavioral', 'structure']),
('Technical Problem-Solving Approach', 'Break down complex problems into smaller parts. Explain your thought process out loud. Start with brute force, then optimize.', 'technical', ARRAY['problem-solving', 'coding', 'algorithms']),
('Research the Company Thoroughly', 'Study the company''s mission, values, recent news, and products. This shows genuine interest and helps you ask informed questions.', 'general', ARRAY['preparation', 'research', 'company-culture']),
('Prepare Questions for the Interviewer', 'Always have thoughtful questions ready about the role, team culture, growth opportunities, and company direction.', 'hr', ARRAY['questions', 'engagement', 'curiosity']),
('Practice Common Technical Questions', 'Review data structures, algorithms, and system design concepts. Practice coding on a whiteboard or shared screen.', 'technical', ARRAY['coding', 'practice', 'preparation']);

-- Insert sample video tutorials
INSERT INTO public.video_tutorials (title, description, youtube_url, thumbnail_url, category, duration_minutes) VALUES
('Complete Technical Interview Guide', 'Comprehensive guide covering data structures, algorithms, and coding best practices for technical interviews.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'technical', 45),
('HR Interview Mastery', 'Learn how to answer common HR questions with confidence and authenticity.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'hr', 30),
('System Design Interview Preparation', 'Step-by-step approach to tackling system design questions in technical interviews.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'technical', 60);

-- Add trigger for automatic timestamp updates on interview_tips
CREATE TRIGGER update_interview_tips_updated_at
BEFORE UPDATE ON public.interview_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for automatic timestamp updates on video_tutorials
CREATE TRIGGER update_video_tutorials_updated_at
BEFORE UPDATE ON public.video_tutorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();