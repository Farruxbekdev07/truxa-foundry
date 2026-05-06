/**
 * AI Suggestions service.
 *
 * The original Supabase Edge Function `ai-suggestions` lived server-side and
 * called the Lovable AI Gateway. After the Firebase migration, you should
 * deploy an equivalent Firebase Cloud Function (HTTPS) that:
 *   - accepts { startup: <startup doc> } in the body,
 *   - calls your AI provider (OpenAI, Gemini, etc.) using your own API key,
 *   - returns { suggestions, startup } in the same shape consumed by
 *     src/pages/AISuggestions.tsx.
 *
 * Set VITE_AI_SUGGESTIONS_ENDPOINT in .env.local to your Cloud Function URL.
 * Until then, this returns a deterministic placeholder so the UI stays usable.
 */
import { auth } from "./config";
import { listDocs } from "./firestore";

export interface Suggestions {
  productMarketFit: { score: number; strengths: string[]; improvements: string[] };
  growthStrategy: { immediateActions: string[]; longTermGoals: string[] };
  marketInsights: {
    opportunities: string[];
    challenges: string[];
    competitiveAdvantage: string;
  };
  teamAndResources: { currentNeeds: string[]; recommendations: string[] };
  overallSummary: string;
}

export interface AISuggestionsResponse {
  suggestions: Suggestions;
  startup: string;
}

interface StartupDoc {
  name: string;
  description?: string | null;
  industry?: string | null;
  stage?: string | null;
  problem?: string | null;
  solution?: string | null;
  target_market?: string | null;
  team_info?: string | null;
  founder_id: string;
}

export async function fetchAISuggestions(): Promise<AISuggestionsResponse> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const startups = await listDocs<StartupDoc>("startups", {
    where: [["founder_id", "==", user.uid]],
    limit: 1,
  });
  const startup = startups[0];
  if (!startup) throw new Error("No startup found");

  const endpoint = import.meta.env.VITE_AI_SUGGESTIONS_ENDPOINT as string | undefined;

  if (endpoint) {
    const token = await user.getIdToken();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ startup }),
    });
    if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`);
    return (await res.json()) as AISuggestionsResponse;
  }

  // Placeholder until VITE_AI_SUGGESTIONS_ENDPOINT is configured.
  return {
    startup: startup.name,
    suggestions: {
      productMarketFit: {
        score: 6,
        strengths: [
          "Clear problem statement",
          "Defined target market",
          "Founder has domain insight",
        ],
        improvements: [
          "Validate willingness to pay with 10+ customer interviews",
          "Sharpen the unique differentiator vs incumbents",
          "Add measurable success metrics for the MVP",
        ],
      },
      growthStrategy: {
        immediateActions: [
          "Ship a landing page and collect waitlist signups",
          "Run 5 customer discovery calls per week",
          "Set up basic product analytics",
        ],
        longTermGoals: [
          "Reach $10K MRR within 9 months",
          "Hire one full-time engineer",
          "Apply to a relevant accelerator",
        ],
      },
      marketInsights: {
        opportunities: [
          "Underserved segment within your target market",
          "Tailwinds from recent industry shifts",
        ],
        challenges: [
          "Established competitors with strong distribution",
          "Long enterprise sales cycles",
        ],
        competitiveAdvantage:
          "Your founder–market fit and speed of iteration are your strongest near-term advantages.",
      },
      teamAndResources: {
        currentNeeds: ["Technical co-founder", "Design support", "Early advisors"],
        recommendations: [
          "Recruit one advisor from your target industry",
          "Outsource brand/visual identity initially",
        ],
      },
      overallSummary:
        "Connect your Firebase Cloud Function to VITE_AI_SUGGESTIONS_ENDPOINT to receive real AI-generated insights. This is placeholder content based on your startup profile.",
    },
  };
}
