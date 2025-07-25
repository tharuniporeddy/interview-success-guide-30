import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, role, categoryId } = await req.json();
    
    // Get Gemini API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    console.log(`Generating quiz for ${company} ${role} role`);
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const prompt = `You are a friendly and supportive interview preparation assistant.
    The user has selected a company: ${company} and a role: ${role}.

    Generate exactly 10 unique and relevant multiple-choice interview questions (MCQs) 
    for ${role} at ${company}.
    - Each question should have 4 options (A, B, C, D)
    - Clearly indicate the correct answer
    - Questions should cover easy, medium, and difficult levels.

    Return the response in JSON format:
    {
      "questions": [
        {"question": "Your question", 
         "options": ["Option A","Option B","Option C","Option D"], 
         "answer": "Correct Option Letter"
        }
      ]
    }

    Make questions relevant to ${company} company culture, values, and ${role} specific skills.
    Include a mix of technical, behavioral, and company-specific questions.
    Ensure only one answer is clearly correct for each question.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Generated text:', generatedText);
    
    // Try to parse JSON from the response
    let questions = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```json\n?(.*?)\n?```/s);
      let jsonStr = '';
      
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        jsonStr = generatedText;
      }
      
      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions || [];
      
      // Transform to the expected format
      questions = questions.map(q => ({
        question: q.question,
        option_a: q.options[0],
        option_b: q.options[1], 
        option_c: q.options[2],
        option_d: q.options[3],
        correct_answer: q.answer,
        difficulty: 'medium'
      }));
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      
      // Fallback: create sample questions if parsing fails
      questions = [
        {
          question: `What interests you most about working at ${company}?`,
          option_a: "The salary and benefits package",
          option_b: "The company culture and values alignment",
          option_c: "The office location convenience", 
          option_d: "The flexible working hours",
          correct_answer: "B",
          difficulty: "easy"
        },
        {
          question: `How would you handle a challenging ${role.toLowerCase()} project with tight deadlines?`,
          option_a: "Work overtime without asking for help",
          option_b: "Immediately escalate to management",
          option_c: "Break down tasks, prioritize, and communicate with team",
          option_d: "Focus only on the most important parts",
          correct_answer: "C", 
          difficulty: "medium"
        },
        {
          question: `What ${role.toLowerCase()} skills do you want to develop further?`,
          option_a: "Only technical skills",
          option_b: "Only soft skills", 
          option_c: "Both technical and interpersonal skills",
          option_d: "No additional skills needed",
          correct_answer: "C",
          difficulty: "easy"
        }
      ];
    }
    
    // Validate and clean questions
    questions = questions.filter(q => 
      q.question && q.option_a && q.option_b && q.option_c && q.option_d && q.correct_answer
    ).slice(0, 10); // Limit to 10 questions
    
    // Save generated questions to database for future use
    if (questions.length > 0 && categoryId) {
      const questionsToInsert = questions.map(q => ({
        category_id: categoryId,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || 'medium'
      }));
      
      const { error: insertError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);
        
      if (insertError) {
        console.error('Error saving questions to database:', insertError);
      } else {
        console.log(`Saved ${questions.length} questions to database`);
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ error: error.message, questions: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});