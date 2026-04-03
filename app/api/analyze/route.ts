import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are FridgeFlow's fridge/pantry scanner. The user has sent you a photo of their fridge, pantry, or kitchen.

Your job:
1. Identify every food item, ingredient, or condiment visible in the image.
2. Write a short, witty one-liner "vibe" about the state of their fridge/pantry — honest, slightly roast-y, never mean.
3. Suggest 3 quick meals they could make from what you see.

Be specific with ingredients — "chicken breast" not just "meat", "cheddar cheese" not just "cheese".
Include condiments, sauces, and staples you can see (olive oil, soy sauce, etc).
If the image is blurry or unclear, do your best and note what you can make out.

Return ONLY this JSON, no markdown, no explanation:
{
  "itemsDetected": ["ingredient1", "ingredient2"],
  "vibe": "One witty line about their fridge situation.",
  "suggestions": ["Meal idea 1", "Meal idea 2", "Meal idea 3"]
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // Demo fallback
    await new Promise((r) => setTimeout(r, 2000));
    return NextResponse.json({
      itemsDetected: ["eggs", "milk", "bread", "butter", "cheese"],
      vibe: "Your fridge is 60% functional, 40% chaos. We respect it.",
      suggestions: ["French toast", "Scrambled eggs", "Grilled cheese"],
    });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://fridgeflow.app",
      "X-Title": "FridgeFlow",
    },
  });

  const completion = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
          {
            type: "text",
            text: "What food items do you see? Give me the JSON response.",
          },
        ],
      },
    ],
    max_tokens: 800,
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let result: unknown;
  try {
    result = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "AI returned invalid response. Try again." }, { status: 500 });
  }

  return NextResponse.json(result);
}
