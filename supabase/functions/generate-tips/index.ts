import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { role, topic } = await req.json();
    
    // Using the provided Gemini API key
    const apiKey = 'AIzaSyBxEMpxUsUp5MmfwAAArDo2nHOgWlhoci4';
    
    const prompt = `Generate 5 practical interview tips for ${role} role interviews${topic ? ` related to ${topic}` : ''}. Format as JSON array with objects containing "tip" field. Keep tips concise and actionable.`;

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
    
    // Try to parse JSON from the response
    let tips = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```json\n?(.*?)\n?```/s) || generatedText.match(/\[(.*?)\]/s);
      if (jsonMatch) {
        tips = JSON.parse(jsonMatch[1] ? `[${jsonMatch[1]}]` : jsonMatch[0]);
      } else {
        // Fallback: create tips from plain text
        const lines = generatedText.split('\n').filter(line => line.trim() && !line.includes('```'));
        tips = lines.slice(0, 5).map(line => ({ tip: line.replace(/^\d+\.\s*/, '').trim() }));
      }
    } catch {
      // Fallback tips if parsing fails
      tips = [
        { tip: `Research the company thoroughly before your ${role.toLowerCase()} interview.` },
        { tip: `Prepare specific examples that demonstrate your ${role.toLowerCase()} skills.` },
        { tip: "Practice common interview questions out loud." },
        { tip: "Prepare thoughtful questions to ask the interviewer." },
        { tip: "Follow up with a thank-you email within 24 hours." }
      ];
    }

    return new Response(JSON.stringify({ tips }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-tips function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});