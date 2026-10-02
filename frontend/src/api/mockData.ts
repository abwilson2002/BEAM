import type { Company, Score } from "@/types";

export const DEFAULT_MOTIVATION: Score = 2;

const COMPANY_SEEDS: ReadonlyArray<readonly [name: string, industry: string]> = [
  ["Stripe", "Fintech"],
  ["Plaid", "Fintech"],
  ["Brex", "Fintech"],
  ["Ramp", "Fintech"],
  ["Robinhood", "Fintech"],
  ["Datadog", "Observability"],
  ["Grafana Labs", "Observability"],
  ["New Relic", "Observability"],
  ["Snowflake", "Data Infrastructure"],
  ["Databricks", "Data Infrastructure"],
  ["MongoDB", "Data Infrastructure"],
  ["Confluent", "Data Infrastructure"],
  ["Cloudflare", "Cloud & Networking"],
  ["Fastly", "Cloud & Networking"],
  ["DigitalOcean", "Cloud & Networking"],
  ["Vercel", "Developer Tools"],
  ["Supabase", "Developer Tools"],
  ["GitLab", "Developer Tools"],
  ["HashiCorp", "Developer Tools"],
  ["Postman", "Developer Tools"],
  ["Twilio", "Communications"],
  ["Discord", "Communications"],
  ["Slack", "Communications"],
  ["Zoom", "Communications"],
  ["Notion", "Productivity"],
  ["Figma", "Productivity"],
  ["Asana", "Productivity"],
  ["Airtable", "Productivity"],
  ["Canva", "Productivity"],
  ["Okta", "Security"],
  ["CrowdStrike", "Security"],
  ["1Password", "Security"],
  ["Snyk", "Security"],
  ["Anthropic", "Artificial Intelligence"],
  ["OpenAI", "Artificial Intelligence"],
  ["Scale AI", "Artificial Intelligence"],
  ["Hugging Face", "Artificial Intelligence"],
  ["Shopify", "E-commerce"],
  ["Instacart", "E-commerce"],
  ["DoorDash", "E-commerce"],
];

/** Small seeded PRNG (mulberry32) so mock data is identical on every load. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(2026);

function randomScore(): Score {
  return (Math.floor(random() * 3) + 1) as Score;
}

export function createMockCompany(
  id: string,
  name: string,
  industry: string,
): Company {
  return {
    id,
    name,
    industry,
    hasAlumni: random() < 0.45,
    postingsScore: randomScore(),
    motivationScore: DEFAULT_MOTIVATION,
  };
}

export const MOCK_COMPANIES: Company[] = COMPANY_SEEDS.map(
  ([name, industry], index) =>
    createMockCompany(`company-${index + 1}`, name, industry),
);
