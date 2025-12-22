import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's startup data with new fields
    const { data: startup, error: startupError } = await supabaseClient
      .from("startups")
      .select("*")
      .eq("founder_id", user.id)
      .maybeSingle();

    if (startupError) {
      console.error("Startup fetch error:", startupError);
      return new Response(JSON.stringify({ error: "Failed to fetch startup data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!startup) {
      return new Response(JSON.stringify({ error: "No startup found", suggestions: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch founder profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enhanced context with new fields
    const startupContext = `
Startup Name: ${startup.name || "Not provided"}
Industry: ${startup.industry || "Not specified"}
Stage: ${startup.stage || "Not specified"}
Description: ${startup.description || "No description provided"}
Target Market: ${startup.target_market || "Not specified"}
Problem Being Solved: ${startup.problem || "Not specified"}
Solution: ${startup.solution || "Not specified"}
Team Information: ${startup.team_info || "Not specified"}
Looking for Team: ${startup.looking_for_team ? "Yes" : "No"}
Looking for Funding: ${startup.looking_for_funding ? "Yes" : "No"}
Looking for Mentorship: ${startup.looking_for_mentorship ? "Yes" : "No"}
Current Rating: ${startup.rating || 0}/5
Founder Name: ${profile?.full_name || "Unknown"}
Founder Bio: ${profile?.bio || "No bio provided"}
    `.trim();

    const systemPrompt = `You are a startup advisor AI for Truxa Foundry, an AI-powered startup validation platform. Analyze the startup profile comprehensively and provide actionable, specific suggestions based on the problem they're solving, their solution, and target market. Be encouraging but honest and data-driven. Format your response as JSON with these exact keys:

{
  "productMarketFit": {
    "score": <number 1-10, based on problem-solution clarity and target market fit>,
    "strengths": [<array of 2-3 specific strengths based on their problem/solution>],
    "improvements": [<array of 3-4 specific, actionable improvements>]
  },
  "growthStrategy": {
    "immediateActions": [<array of 3-4 specific actions for next 30 days based on their stage>],
    "longTermGoals": [<array of 2-3 goals for next 6-12 months>]
  },
  "marketInsights": {
    "opportunities": [<array of 2-3 market opportunities specific to their target market>],
    "challenges": [<array of 2-3 potential challenges based on their industry>],
    "competitiveAdvantage": <string describing their potential unique value proposition based on their solution>
  },
  "teamAndResources": {
    "currentNeeds": [<array of 2-3 immediate resource needs based on their stage and team info>],
    "recommendations": [<array of 2-3 team building recommendations>]
  },
  "overallSummary": <2-3 sentence executive summary of the startup's potential, key focus areas, and recommended next steps>
}

Only respond with valid JSON, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this startup profile and provide comprehensive validation insights:\n\n${startupContext}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No suggestions generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response from AI
    let suggestions;
    try {
      // Clean up markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", rawContent: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestions, startup: startup.name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});