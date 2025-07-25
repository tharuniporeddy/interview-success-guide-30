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
    const { role } = await req.json();
    
    // Use predefined tips based on role type
    const behavioralTips = [
      "Be honest and confident", 
      "Use STAR method for answers", 
      "Maintain positive body language", 
      "Research company culture", 
      "Show enthusiasm for the role"
    ];
    
    const technicalTips = [
      "Brush up on core technical subjects", 
      "Prepare for coding or problem-solving tasks", 
      "Explain your reasoning clearly", 
      "Show projects or hands-on experience", 
      "Be clear about tools & technologies used"
    ];
    
    const generalTips = [
      "Know about the company background", 
      "Prepare for common HR questions", 
      "Be on time for the interview", 
      "Dress professionally", 
      "Keep your resume updated and handy"
    ];
    
    // Determine which tips to use based on role
    let selectedTips = generalTips;
    if (role.toLowerCase().includes('hr') || role.toLowerCase().includes('human resources')) {
      selectedTips = behavioralTips;
    } else if (role.toLowerCase().includes('technical') || role.toLowerCase().includes('developer') || 
               role.toLowerCase().includes('engineer') || role.toLowerCase().includes('programmer')) {
      selectedTips = technicalTips;
    }
    
    return new Response(JSON.stringify({ tips: selectedTips }), {
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