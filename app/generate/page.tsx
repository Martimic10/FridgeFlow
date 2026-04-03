"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Recipe {
  name: string;
  time: string;
  difficulty: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  personality?: string;
}

function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Easy: "text-[#2D6A4F] bg-[#D8F3DC]",
    Moderate: "text-amber-700 bg-amber-100",
    Hard: "text-red-700 bg-red-100",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[level] ?? "text-[#6B6B6B] bg-[#F2EFE9]"}`}>
      {level}
    </span>
  );
}

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const [open, setOpen] = useState(false);
  const delayClass = ["animate-fade-in-1", "animate-fade-in-2", "animate-fade-in-3"][index] ?? "animate-fade-in-1";

  return (
    <div className={`bg-white border border-[#E0DBD3] rounded-3xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all animate-fade-in ${delayClass}`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-bold text-lg text-[#1A1A1A] leading-snug flex-1">{recipe.name}</h3>
          <DifficultyBadge level={recipe.difficulty} />
        </div>

        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] bg-[#D8F3DC] px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" d="M12 6v6l4 2" strokeWidth="2"/>
            </svg>
            {recipe.time}
          </span>
        </div>

        {/* Ingredients used */}
        <div className="mb-4">
          <p className="text-xs text-[#9A9A9A] mb-2 font-semibold uppercase tracking-wider">Using</p>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredientsUsed.map((ing) => (
              <span key={ing} className="text-xs text-[#2D6A4F] bg-[#D8F3DC]/60 border border-[#2D6A4F]/10 px-2 py-0.5 rounded-full">
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Missing ingredients */}
        {recipe.missingIngredients.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[#9A9A9A] mb-2 font-semibold uppercase tracking-wider">
              You&apos;ll also need
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recipe.missingIngredients.map((ing) => (
                <span key={ing} className="text-xs text-[#6B6B6B] bg-[#F2EFE9] border border-[#E0DBD3] px-2 py-0.5 rounded-full">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipe.personality && (
          <p className="text-xs text-[#9A9A9A] italic mt-4">{recipe.personality}</p>
        )}
      </div>

      {/* Steps toggle */}
      <div className="border-t border-[#F2EFE9]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-[#2D6A4F] hover:bg-[#F2EFE9] transition-colors"
        >
          <span>How to make it</span>
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {open && (
          <ol className="px-6 pb-6 space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#1A1A1A]">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-[#444]">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-[#E0DBD3] rounded-3xl p-6 animate-pulse"
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          <div className="h-5 bg-[#F2EFE9] rounded-full mb-4 w-3/4"/>
          <div className="h-7 bg-[#F2EFE9] rounded-full mb-6 w-1/3"/>
          <div className="flex gap-2 flex-wrap mb-3">
            {[56, 72, 48].map((w) => (
              <div key={w} className="h-5 bg-[#F2EFE9] rounded-full" style={{ width: w }}/>
            ))}
          </div>
          <div className="h-4 bg-[#F2EFE9] rounded-full w-2/3"/>
        </div>
      ))}
    </div>
  );
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  const [ingredients, setIngredients] = useState(initialQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) generateRecipes(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateRecipes(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: query }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setRecipes(data.recipes ?? data);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    generateRecipes(ingredients);
    window.history.replaceState(null, "", `/generate?q=${encodeURIComponent(ingredients.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#1A1A1A]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto border-b border-[#E0DBD3] bg-[#F2EFE9]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <img src="/fridgeflow-logo-removebg-preview.png" alt="FridgeFlow logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-[#1A1A1A] tracking-tight">FridgeFlow</span>
        </button>
        <span className="text-xs text-[#9A9A9A] hidden sm:block">Enter your ingredients below</span>
      </nav>

      <main className="px-6 sm:px-10 py-12 max-w-5xl mx-auto">
        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="eggs, cheese, bread… be honest"
            disabled={loading}
            className="flex-1 bg-white border border-[#E0DBD3] rounded-2xl px-5 py-4 text-[#1A1A1A] placeholder-[#C0BAB0] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-all text-base shadow-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={!ingredients.trim() || loading}
            className="btn-green px-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Thinking..." : "Generate Meals"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div>
            <p className="text-center text-[#9A9A9A] text-sm mb-8 animate-pulse">
              Rummaging through your fridge...
            </p>
            <LoadingSkeleton />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-5 text-sm">
              <p className="font-semibold mb-1">Couldn&apos;t generate recipes</p>
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && recipes.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                Here&apos;s what you&apos;re making tonight
              </h2>
              <p className="text-[#9A9A9A] text-sm">
                Based on: <span className="text-[#1A1A1A] font-medium">{ingredients}</span>
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {recipes.map((recipe, i) => (
                <RecipeCard key={recipe.name + i} recipe={recipe} index={i} />
              ))}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={handleSubmit}
                className="text-sm text-[#9A9A9A] hover:text-[#2D6A4F] transition-colors underline underline-offset-4"
              >
                Generate different recipes
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !hasGenerated && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧊</div>
            <p className="text-[#9A9A9A] text-base">
              Tell us what&apos;s in your fridge and we&apos;ll figure out dinner.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F2EFE9] flex items-center justify-center">
          <div className="text-[#9A9A9A] text-sm animate-pulse">Loading...</div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
