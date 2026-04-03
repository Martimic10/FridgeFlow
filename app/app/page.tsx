"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ───────────────────────────────────────────────── */
interface Recipe {
  name: string;
  time: string;
  difficulty: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  personality?: string;
}

interface ScanResult {
  itemsDetected: string[];
  suggestions: string[];
  vibe: string;
}

/* ─── Hooks ───────────────────────────────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  return mobile;
}

function useRotatingMessage(messages: string[], active: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) { setIndex(0); return; }
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(id);
  }, [active, messages]);
  return messages[index];
}

/* ─── Mock image analysis ─────────────────────────────────── */
const MOCK_RESULTS: ScanResult[] = [
  {
    itemsDetected: ["eggs", "milk", "bread", "butter", "cheese"],
    suggestions: ["French toast", "Scrambled eggs", "Grilled cheese"],
    vibe: "Your fridge is 60% functional, 40% chaos. We respect it.",
  },
  {
    itemsDetected: ["chicken", "garlic", "olive oil", "lemon", "spinach"],
    suggestions: ["Garlic chicken", "Chicken stir-fry", "Lemon herb bowl"],
    vibe: "Actually impressive. Are you a chef or just anxious?",
  },
  {
    itemsDetected: ["leftover pasta", "tomatoes", "onion", "parmesan"],
    suggestions: ["Pasta bake", "Quick tomato pasta", "Frittata"],
    vibe: "The leftovers are judging you. Use them.",
  },
];

async function analyzePantryImage(_image: File): Promise<ScanResult> {
  await new Promise((r) => setTimeout(r, 2800));
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
}

/* ─── Difficulty badge ────────────────────────────────────── */
function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Easy:     "text-[#2D6A4F] bg-[#D8F3DC]",
    Moderate: "text-amber-700 bg-amber-100",
    Hard:     "text-red-700   bg-red-100",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[level] ?? "text-[#6B6B6B] bg-[#F2EFE9]"}`}>
      {level}
    </span>
  );
}

/* ─── Recipe card ─────────────────────────────────────────── */
function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="recipe-card bg-white border-2 border-[#1A1A1A] rounded-[20px] overflow-hidden
                 shadow-[4px_4px_0_#1A1A1A] hover:shadow-[6px_6px_0_#1A1A1A]
                 hover:-translate-y-0.5 transition-all duration-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="h-1.5 w-full bg-[#2D6A4F]" />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="heading-chunky text-xl text-[#1A1A1A] leading-snug flex-1">{recipe.name}</h3>
          <DifficultyBadge level={recipe.difficulty} />
        </div>

        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F]
                           bg-[#D8F3DC] border border-[#2D6A4F]/15 px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" d="M12 6v6l4 2" strokeWidth="2"/>
            </svg>
            {recipe.time}
          </span>
        </div>

        {recipe.ingredientsUsed.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest mb-2">Using</p>
            <div className="flex flex-wrap gap-1.5">
              {recipe.ingredientsUsed.map((ing) => (
                <span key={ing} className="text-xs text-[#2D6A4F] bg-[#D8F3DC]/60 border border-[#2D6A4F]/15 px-2 py-0.5 rounded-full font-medium">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipe.missingIngredients.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest mb-2">You&apos;ll also need</p>
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
          <p className="body-mono text-xs text-[#9A9A9A] italic mt-4">&ldquo;{recipe.personality}&rdquo;</p>
        )}
      </div>

      <div className="border-t-2 border-[#F2EFE9]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold
                     text-[#2D6A4F] hover:bg-[#F2EFE9] transition-colors duration-150"
        >
          <span>How to make it</span>
          <span className={`w-6 h-6 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center
                            text-xs font-black bg-[#F2EFE9] transition-transform duration-200
                            ${open ? "rotate-45" : ""}`}>
            +
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-150" : "max-h-0"}`}>
          <ol className="px-6 pb-6 space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#2D6A4F] text-white
                                 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="body-mono text-sm text-[#444] leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-[#E0DBD3] rounded-[20px] p-6 animate-pulse">
      <div className="h-5 bg-[#F2EFE9] rounded-full w-3/4 mb-4" />
      <div className="h-6 bg-[#F2EFE9] rounded-full w-1/4 mb-5" />
      <div className="flex gap-2 flex-wrap mb-4">
        {[60, 80, 50, 70].map((w) => (
          <div key={w} className="h-5 bg-[#F2EFE9] rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#F2EFE9] rounded-full w-full" />
        <div className="h-3 bg-[#F2EFE9] rounded-full w-5/6" />
      </div>
    </div>
  );
}

/* ─── Preview modal ───────────────────────────────────────── */
function PreviewModal({
  src, onRetake, onConfirm, loading, loadingMsg,
}: {
  src: string; onRetake: () => void; onConfirm: () => void;
  loading: boolean; loadingMsg: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!loading ? onRetake : undefined} />
      <div className="relative w-full max-w-sm bg-white border-2 border-[#1A1A1A] rounded-3xl
                      overflow-hidden shadow-[6px_6px_0_#1A1A1A] slide-up">
        <div className="h-1.5 bg-[#2D6A4F]" />
        <div className="p-5">
          <p className="heading-chunky text-[#1A1A1A] text-xl mb-0.5">Looking good?</p>
          <p className="body-mono text-[#9A9A9A] text-xs mb-4">This is either impressive or concerning.</p>

          <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0DBD3] mb-5 aspect-4/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Fridge preview" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col
                              items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
                <p key={loadingMsg} className="body-mono text-[#2D6A4F] text-xs loading-fade">{loadingMsg}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRetake}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] text-sm
                         font-bold bg-white shadow-[2px_2px_0_#1A1A1A] hover:shadow-none
                         hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40"
            >
              Retake
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl btn-green text-sm disabled:opacity-50
                         disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? "Analysing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Scan result card ────────────────────────────────────── */
function ScanResultCard({ result, onUseIngredients }: {
  result: ScanResult; onUseIngredients: (items: string[]) => void;
}) {
  return (
    <div className="bg-white border-2 border-[#1A1A1A] rounded-[20px] overflow-hidden
                    shadow-[4px_4px_0_#1A1A1A] scan-result">
      <div className="h-1.5 bg-[#E8682A]" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">🔍</span>
          <div>
            <p className="heading-chunky text-[#1A1A1A] text-lg">Fridge report</p>
            <p className="body-mono text-[#9A9A9A] text-[10px]">No judgment (lie).</p>
          </div>
        </div>

        {/* Vibe */}
        <div className="bg-[#FFF8E8] border border-[#E8682A]/20 rounded-xl px-4 py-3 mb-5">
          <p className="body-mono text-[#B45309] text-xs italic">&ldquo;{result.vibe}&rdquo;</p>
        </div>

        {/* Detected items */}
        <div className="mb-5">
          <p className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest mb-2">Items detected</p>
          <div className="flex flex-wrap gap-1.5">
            {result.itemsDetected.map((item) => (
              <span key={item} className="text-xs text-[#2D6A4F] bg-[#D8F3DC]/60 border border-[#2D6A4F]/15
                                          px-2.5 py-1 rounded-full font-medium capitalize">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <p className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest mb-2">Meal ideas</p>
          <ul className="space-y-2">
            {result.suggestions.map((s) => (
              <li key={s} className="flex items-center gap-2.5 body-mono text-sm text-[#1A1A1A]">
                <span className="w-5 h-5 rounded-full bg-[#E8D84A] border-2 border-[#1A1A1A] flex items-center justify-center shrink-0">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onUseIngredients(result.itemsDetected)}
          className="btn-green w-full py-3 text-sm"
        >
          Generate full recipes from these →
        </button>
      </div>
    </div>
  );
}

/* ─── Drag & drop zone ────────────────────────────────────── */
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                  transition-all duration-200 group
                  ${dragging
                    ? "border-[#2D6A4F] bg-[#D8F3DC]/20"
                    : "border-[#E0DBD3] hover:border-[#2D6A4F]/50 hover:bg-[#F2EFE9]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
        {dragging ? "📥" : "📁"}
      </div>
      <p className="font-bold text-[#1A1A1A] text-sm mb-1">
        {dragging ? "Drop it like it's hot" : "Drag & drop a fridge photo"}
      </p>
      <p className="body-mono text-[#C0BAB0] text-xs">or click to browse files</p>
    </div>
  );
}

/* ─── Constants ───────────────────────────────────────────── */
const SCAN_MESSAGES = [
  "Scanning chaos...",
  "Judging contents...",
  "Interpreting leftovers...",
  "Consulting the fridge oracle...",
  "Almost done judging...",
];

const RECIPE_MESSAGES = [
  "Thinking...",
  "Looking into your fridge...",
  "Finding something edible...",
  "Cooking ideas coming up...",
  "Almost there...",
];

/* ─── Page ────────────────────────────────────────────────── */
export default function AppPage() {
  const isMobile = useIsMobile();

  const [image, setImage]             = useState<File | null>(null);
  const [imageUrl, setImageUrl]       = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scanning, setScanning]       = useState(false);
  const [scanResult, setScanResult]   = useState<ScanResult | null>(null);

  const [ingredients, setIngredients]   = useState("");
  const [recipes, setRecipes]           = useState<Recipe[]>([]);
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const cameraRef   = useRef<HTMLInputElement>(null);
  const uploadRef   = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef  = useRef<HTMLDivElement>(null);

  const scanMsg   = useRotatingMessage(SCAN_MESSAGES, scanning);
  const recipeMsg = useRotatingMessage(RECIPE_MESSAGES, generating);

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  function handleFile(file: File) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setPreviewOpen(true);
  }

  function handleRetake() {
    setPreviewOpen(false);
    setImage(null);
    setImageUrl("");
    setScanResult(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
  }

  async function handleConfirm() {
    if (!image) return;
    setScanning(true);
    try {
      const result = await analyzePantryImage(image);
      setScanResult(result);
      setPreviewOpen(false);
    } finally {
      setScanning(false);
    }
  }

  function handleUseIngredients(items: string[]) {
    setIngredients(items.join(", "));
    setScanResult(null);
    setImage(null);
    setImageUrl("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function generateRecipes() {
    if (!ingredients.trim() || generating) return;
    setGenerating(true);
    setError("");
    setRecipes([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setRecipes(data.recipes ?? data);
      setHasGenerated(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong in the kitchen.");
    } finally {
      setGenerating(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateRecipes(); }
  }

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#1A1A1A]">

      {/* Nav */}
      <nav className="bg-white border-b-2 border-[#E0DBD3] px-5 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/fridgeflow-logo-removebg-preview.png" alt="FridgeFlow logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-[#1A1A1A] tracking-tight">FridgeFlow</span>
          </div>
          <span className="body-mono text-[#9A9A9A] text-sm">You&apos;re in 👀</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">

        {/* Hero */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E0DBD3]
                          text-[#2D6A4F] body-mono text-xs px-3 py-1.5 rounded-full mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse"/>
            Let&apos;s see what you&apos;re working with...
          </div>
          <h1 className="heading-chunky text-4xl sm:text-5xl text-[#1A1A1A] leading-tight mb-2">
            Let&apos;s inspect
            <br/>
            <span className="text-[#2D6A4F]">your fridge</span>
          </h1>
          <p className="body-mono text-[#9A9A9A] text-sm">We will judge it gently.</p>
        </div>

        {/* Scan section */}
        <div className="space-y-4">

          {/* Mobile: camera + upload buttons */}
          {isMobile ? (
            <div className="grid grid-cols-2 gap-3">
              <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center gap-2.5 bg-white border-2 border-[#1A1A1A]
                           rounded-2xl px-4 py-6 shadow-[3px_3px_0_#1A1A1A] hover:shadow-none
                           hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📷</span>
                <div className="text-center">
                  <p className="font-bold text-[#1A1A1A] text-sm">Scan Fridge</p>
                  <p className="body-mono text-[#9A9A9A] text-[10px]">opens camera</p>
                </div>
              </button>

              <input ref={uploadRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              <button
                onClick={() => uploadRef.current?.click()}
                className="flex flex-col items-center gap-2.5 bg-white border-2 border-[#1A1A1A]
                           rounded-2xl px-4 py-6 shadow-[3px_3px_0_#1A1A1A] hover:shadow-none
                           hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🖼️</span>
                <div className="text-center">
                  <p className="font-bold text-[#1A1A1A] text-sm">Upload Image</p>
                  <p className="body-mono text-[#9A9A9A] text-[10px]">from photos</p>
                </div>
              </button>
            </div>
          ) : (
            /* Desktop: two buttons + drag & drop */
            <div className="space-y-3">
              <input ref={uploadRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => uploadRef.current?.click()}
                  className="btn-green flex items-center justify-center gap-2 py-4 text-sm"
                >
                  <span className="text-lg">📷</span> Scan Fridge / Pantry
                </button>
                <button
                  onClick={() => uploadRef.current?.click()}
                  className="btn-green-outline flex items-center justify-center gap-2 py-4 text-sm"
                >
                  <span className="text-lg">🖼️</span> Upload Image
                </button>
              </div>
              <DropZone onFile={handleFile}/>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E0DBD3]"/>
            <span className="body-mono text-[#C0BAB0] text-xs">or type manually</span>
            <div className="flex-1 h-px bg-[#E0DBD3]"/>
          </div>

          {/* Text input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={handleKey}
              placeholder="eggs, cheese, chicken, rice..."
              rows={3}
              disabled={generating}
              className="w-full bg-white border-2 border-[#1A1A1A] rounded-2xl px-5 py-4
                         text-[#1A1A1A] placeholder-[#C0BAB0] resize-none body-mono
                         focus:outline-none focus:ring-4 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F]
                         disabled:opacity-50 transition-all duration-200 text-sm leading-relaxed
                         shadow-[3px_3px_0_#1A1A1A]"
            />
            {ingredients.length > 0 && !generating && (
              <p className="absolute bottom-3 right-4 body-mono text-[10px] text-[#C0BAB0] select-none">
                ↵ generate
              </p>
            )}
          </div>

          <button
            onClick={generateRecipes}
            disabled={!ingredients.trim() || generating}
            className="btn-orange w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed
                       disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span key={recipeMsg} className="loading-fade">{recipeMsg}</span>
              </span>
            ) : (
              "Generate meals"
            )}
          </button>
        </div>

        {/* Scan result */}
        {scanResult && (
          <ScanResultCard result={scanResult} onUseIngredients={handleUseIngredients}/>
        )}

        {/* Empty state */}
        {!generating && !hasGenerated && !error && !scanResult && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧊</div>
            <p className="body-mono text-[#9A9A9A] text-sm">
              We are about to expose your fridge.
            </p>
          </div>
        )}

        {/* Error */}
        {error && !generating && (
          <div className="bg-white border-2 border-red-300 rounded-2xl px-6 py-5 text-center
                          shadow-[3px_3px_0_#fca5a5]">
            <p className="font-bold text-red-600 text-sm mb-1">Something went wrong in the kitchen.</p>
            <p className="body-mono text-red-400 text-xs">{error}</p>
            <button onClick={generateRecipes}
              className="mt-3 body-mono text-xs text-[#2D6A4F] underline underline-offset-2">
              Try again
            </button>
          </div>
        )}

        {/* Skeletons */}
        {generating && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i}/>)}
          </div>
        )}

        {/* Recipe results */}
        {!generating && recipes.length > 0 && (
          <div ref={resultsRef} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-chunky text-2xl text-[#1A1A1A]">Here&apos;s what you&apos;re making</h2>
                <p className="body-mono text-[#9A9A9A] text-xs mt-0.5">
                  Based on: <span className="text-[#1A1A1A]">{ingredients}</span>
                </p>
              </div>
              <button
                onClick={generateRecipes}
                className="body-mono text-xs text-[#2D6A4F] border-2 border-[#1A1A1A] bg-white
                           px-3 py-1.5 rounded-full shadow-[2px_2px_0_#1A1A1A] hover:shadow-none
                           hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Regenerate
              </button>
            </div>

            {recipes.map((recipe, i) => (
              <RecipeCard key={recipe.name + i} recipe={recipe} index={i}/>
            ))}

            <p className="text-center body-mono text-[#C0BAB0] text-xs pt-2">
              Not feeling any of these?{" "}
              <button onClick={generateRecipes}
                className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1A1A1A] transition-colors">
                Generate different meals
              </button>
            </p>
          </div>
        )}

      </main>

      {/* Preview modal */}
      {previewOpen && imageUrl && (
        <PreviewModal
          src={imageUrl}
          onRetake={handleRetake}
          onConfirm={handleConfirm}
          loading={scanning}
          loadingMsg={scanMsg}
        />
      )}

      <style>{`
        .recipe-card, .scan-result {
          opacity: 0;
          animation: cardIn 0.4s ease forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loading-fade {
          animation: fadeMsg 0.3s ease;
        }
        @keyframes fadeMsg {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
