import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are FridgeFlow's recipe engine — a sharp, practical home cook with actual personality.

Your job: take whatever ingredients someone has and return exactly 3 recipes in valid JSON.

RECIPE RULES:
- Use ONLY the provided ingredients as the base. Minimize missing ingredients.
- Every recipe must be completable in 30 minutes or less.
- Steps must be specific and teach real technique — not vague instructions like "cook until done."
  Write steps the way a knowledgeable friend would explain them: exact temperatures, visual cues,
  timing, and the "why" behind each action when it matters.
- Max 6 steps per recipe. Every step should move the dish forward — no filler.
- Quantities must be explicit. "A pinch" is fine. "Some" is not.
- Difficulty: Easy (one pan, basic skills), Moderate (some technique, timing matters), Hard (genuine challenge).

PERSONALITY RULES:
- The "personality" field is one punchy line that makes the recipe feel alive.
- It can be encouraging, slightly self-aware, or gently roast the dish.
- Never be cringe. Never use "delicious," "amazing," or "yummy."
- Examples of good personality lines:
  "Tastes like takeout. Costs less than a coffee."
  "The one recipe you'll memorize and make forever."
  "Humble ingredients. Embarrassingly good result."
  "Better than it has any right to be given what you're working with."

OUTPUT FORMAT — return ONLY this JSON, no markdown, no explanation, no code fences:
[
  {
    "name": "Recipe Name",
    "time": "X min",
    "difficulty": "Easy" | "Moderate" | "Hard",
    "ingredientsUsed": ["ingredient1", "ingredient2"],
    "missingIngredients": ["ingredient3"],
    "steps": ["Step 1 text", "Step 2 text"],
    "personality": "One punchy line."
  }
]`;

const USER_PROMPT = (ingredients: string) =>
  `My ingredients: ${ingredients}

Give me 3 recipes. Return only the JSON array — nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ingredients: string = body.ingredients ?? "";

    if (!ingredients.trim()) {
      return NextResponse.json({ error: "No ingredients provided." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1400));
      return NextResponse.json({
        recipes: [
          {
            name: "Brown Butter Scrambled Eggs on Toast",
            time: "10 min",
            difficulty: "Easy",
            ingredientsUsed: ["eggs", "butter", "bread", "garlic"],
            missingIngredients: ["fresh chives"],
            steps: [
              "Let butter sit in a cold pan, then turn heat to medium. Watch it foam, then go golden and smell nutty — that's brown butter. Pull off heat for 30 seconds.",
              "Whisk 3 eggs with a pinch of salt and a tiny splash of water. Not milk. Water.",
              "Return pan to low heat. Pour in eggs and drag a spatula through them slowly every few seconds.",
              "While eggs cook, toast your bread. Rub the hot toast with a raw garlic clove — one swipe is enough.",
              "Pull eggs off heat while they still look slightly underdone. Residual heat finishes them.",
              "Pile onto toast immediately. Crack black pepper over the top and eat standing up.",
            ],
            personality: "Better than any café's $18 version. Don't let them gaslight you anymore.",
          },
          {
            name: "Creamy Tomato Pasta",
            time: "20 min",
            difficulty: "Easy",
            ingredientsUsed: ["pasta", "canned tomatoes", "garlic", "olive oil", "cream"],
            missingIngredients: ["parmesan", "fresh basil"],
            steps: [
              "Salt your pasta water until it tastes like the sea. Seriously. Boil pasta until just al dente.",
              "Smash and peel 4 garlic cloves — don't bother mincing, they'll melt.",
              "Warm olive oil in a wide pan over medium. Add garlic and let it go golden and soft, about 4 min.",
              "Pour in one can of crushed tomatoes. Season with salt and a pinch of sugar. Simmer 8 min until thickened.",
              "Reduce heat to low, stir in a splash of cream. Let it turn the sauce a deep rose color.",
              "Drain pasta, toss directly into sauce with a ladle of pasta water. Stir until glossy and clingy.",
            ],
            personality: "The pasta you'll make on a random Tuesday and think about all week.",
          },
          {
            name: "Garlicky Egg Fried Rice",
            time: "15 min",
            difficulty: "Easy",
            ingredientsUsed: ["rice", "eggs", "garlic", "soy sauce", "butter"],
            missingIngredients: ["sesame oil", "green onions"],
            steps: [
              "Day-old cold rice is ideal — straight from the fridge. Freshly cooked rice will steam and go mushy.",
              "Mince 4 garlic cloves. Get a wok or your largest pan ripping hot before adding any oil.",
              "Add a neutral oil, then the garlic. Stir constantly for 60 seconds — golden not burnt.",
              "Push garlic to the edge. Add butter to the center, crack in 2 eggs and scramble quickly.",
              "Before eggs fully set, add the cold rice and break up any clumps with your spatula.",
              "Splash in soy sauce around the edge of the pan (not the middle — it steams better that way). Toss everything hard for 2 min on high heat.",
            ],
            personality: "Tastes like takeout. Costs nothing. You've had this in your fridge for two days — use it.",
          },
        ],
      });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://fridgeflow.app",
        "X-Title": "FridgeFlow",
      },
    });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT(ingredients) },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "[]";

    // Strip any accidental markdown code fences
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    const recipes = Array.isArray(parsed)
      ? parsed
      : (parsed as Record<string, unknown>).recipes ??
        Object.values(parsed as Record<string, unknown>)[0];

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
