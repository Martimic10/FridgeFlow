import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a practical home cook helping someone decide what to eat quickly.
Rules:
- Use ONLY the provided ingredients as much as possible
- Max 30 minutes cook time
- Keep recipes simple and realistic
- Return exactly 3 recipes
- Be slightly funny and human, not robotic
- Include steps (max 6), time, difficulty, ingredientsUsed, missingIngredients
- Add a short "personality" field per recipe — one punchy line (e.g. "This one actually hits")
- Difficulty is one of: Easy, Moderate, Hard`;

const USER_PROMPT_TEMPLATE = (ingredients: string) =>
  `I have these ingredients: ${ingredients}

Return ONLY valid JSON — no markdown, no explanation, no code fences. Just the raw JSON array:
[
  {
    "name": "",
    "time": "",
    "difficulty": "",
    "ingredientsUsed": [],
    "missingIngredients": [],
    "steps": [],
    "personality": ""
  }
]`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ingredients: string = body.ingredients ?? "";

    if (!ingredients.trim()) {
      return NextResponse.json(
        { error: "No ingredients provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT_TEMPLATE(ingredients) },
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    // Handle both { recipes: [...] } and plain [...] shapes
    const recipes = Array.isArray(parsed)
      ? parsed
      : (parsed as Record<string, unknown>).recipes ?? Object.values(parsed as Record<string, unknown>)[0];

    if (!Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json(
        { error: "Couldn't parse recipes from AI response." },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
