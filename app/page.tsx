"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Cursor follower ─────────────────────────────────────── */
function CursorFollower() {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const cur = useRef({ x: -100, y: -100 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (isMobile) return;
    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);

    function loop() {
      // lerp toward real cursor — gives the "lagging" feel
      cur.current.x += (pos.current.x - cur.current.x) * 0.12;
      cur.current.y += (pos.current.y - cur.current.y) * 0.12;
      if (ref.current) {
        ref.current.style.transform = `translate(${cur.current.x - 16}px, ${cur.current.y - 16}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 w-8 h-8 flex items-center justify-center select-none"
      style={{ willChange: "transform" }}
    >
      <span className="text-2xl drop-shadow-md" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}>
        🍔
      </span>
    </div>
  );
}

/* ─── Hero fridge graphic ─────────────────────────────────── */
const FRIDGE_ITEMS = [
  { emoji: "🥚", label: "Eggs",      col: "col-span-1" },
  { emoji: "🧀", label: "Cheese",    col: "col-span-1" },
  { emoji: "🥦", label: "Broccoli",  col: "col-span-1" },
  { emoji: "🍅", label: "Tomatoes",  col: "col-span-1" },
  { emoji: "🥕", label: "Carrots",   col: "col-span-1" },
  { emoji: "🧄", label: "Garlic",    col: "col-span-1" },
];

function HeroGraphic() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-115 mx-auto select-none">

      {/* Floating recipe result card — top right */}
      <div className="absolute -top-5 -right-4 z-20 bg-white rounded-2xl shadow-xl border border-[#E0DBD3] px-4 py-3 flex items-center gap-3 min-w-45 animate-float">
        <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-lg shrink-0">
          🍳
        </div>
        <div>
          <p className="text-xs font-bold text-[#1A1A1A] leading-tight">Egg & Cheese Toast</p>
          <p className="text-[10px] text-[#2D6A4F] font-semibold mt-0.5">⚡ 8 min · Easy</p>
        </div>
      </div>

      {/* Floating tag — bottom left */}
      <div className="absolute -bottom-3 -left-4 z-20 bg-[#2D6A4F] text-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2 animate-float-slow">
        <span className="text-base">✨</span>
        <div>
          <p className="text-xs font-bold leading-tight">3 recipes found</p>
          <p className="text-[10px] text-[#95D5B2]">from your fridge</p>
        </div>
      </div>

      {/* Fridge body */}
      <div className="relative bg-white rounded-[28px] border border-[#E0DBD3] shadow-2xl overflow-hidden">

        {/* Fridge top bar */}
        <div className="bg-[#F2EFE9] border-b border-[#E0DBD3] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#E0DBD3] rounded-full px-3 py-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <span className="text-[10px] text-[#9A9A9A] font-medium">eggs, cheese, broccoli…</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Shelf label */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-widest">What&apos;s inside</span>
          <span className="text-[10px] text-[#C0BAB0]">6 items</span>
        </div>

        {/* Food grid */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-5">
          {FRIDGE_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className={`group bg-[#F8F6F2] border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200
                ${active === i
                  ? "border-[#2D6A4F] bg-[#F0FAF4] shadow-md scale-[1.04]"
                  : "border-[#EAE6DF] hover:border-[#2D6A4F]/40 hover:scale-[1.02]"
                }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] font-semibold text-[#6B6B6B] group-hover:text-[#2D6A4F] transition-colors">
                {item.label}
              </span>
              {active === i && (
                <span className="text-[8px] text-[#2D6A4F] font-bold bg-[#D8F3DC] px-1.5 py-0.5 rounded-full">
                  selected
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom CTA inside fridge */}
        <div className="mx-5 mb-5 bg-linear-to-r from-[#2D6A4F] to-[#40916C] rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-bold">Ready to cook?</p>
            <p className="text-[#95D5B2] text-[10px]">AI is finding your meals…</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── FAQ accordion ───────────────────────────────────────── */
const FAQS = [
  {
    q: "Do I need an account to use FridgeFlow?",
    a: "Nope. No sign-up, no email, no password. Just open the app, type your ingredients, and get recipes. We respect your time.",
  },
  {
    q: "What if I only have, like, three ingredients?",
    a: "Perfect. FridgeFlow was built for exactly that. Three ingredients, zero ideas — we've got you. The fewer ingredients, the more creative it gets.",
  },
  {
    q: "Will it suggest recipes that require things I don't have?",
    a: "We try hard to avoid that. Each recipe shows you exactly what you have vs. what you're missing. Recipes are ranked to minimize the missing stuff.",
  },
  {
    q: "Is this a subscription?",
    a: "No. $7 once. That's it. You get unlimited generations, all future updates, and zero recurring charges. We hate subscriptions too.",
  },
  {
    q: "What AI model powers FridgeFlow?",
    a: "GPT-4o mini — fast, smart, and practical. We specifically tuned the prompt to avoid pretentious Michelin-star nonsense and keep things real.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes — and on mobile it gets even better. Open your camera, point it at your fridge, and FridgeFlow scans the photo and detects your ingredients automatically. No typing needed. No app store either.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 border-[#1A1A1A] rounded-2xl overflow-hidden transition-all ${open ? "shadow-[3px_3px_0_#1A1A1A]" : ""}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-[#F8F6F2] transition-colors"
      >
        <span className="font-bold text-[#1A1A1A] text-base leading-snug">{q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-sm font-black transition-transform ${open ? "bg-[#E8682A] text-white rotate-45" : "bg-[#F2EFE9] text-[#1A1A1A]"}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white border-t border-[#E0DBD3]">
          <p className="body-mono text-[#6B6B6B] text-sm pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  async function handleBuy() {
    if (buying) return;
    setBuying(true);
    setBuyError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.error || !data.url) throw new Error(data.error ?? "No checkout URL returned.");
      window.location.href = data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setBuyError(msg);
      setBuying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#1A1A1A]">
      <CursorFollower />

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#F2EFE9]/95 backdrop-blur-sm border-b border-[#E0DBD3]">
        <div className="flex items-center justify-between px-5 sm:px-10 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/fridgeflow-logo-removebg-preview.png" alt="FridgeFlow logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-[#1A1A1A] text-lg tracking-tight">FridgeFlow</span>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-[#6B6B6B]">
            <a href="#how-it-works" className="hover:text-[#1A1A1A] transition-colors">How It Works</a>
            <a href="#features"     className="hover:text-[#1A1A1A] transition-colors">Features</a>
            <a href="#faq"          className="hover:text-[#1A1A1A] transition-colors">FAQ</a>
            <a href="#pricing"      className="btn-orange px-5 py-2 text-sm">Pricing</a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden w-10 h-10 rounded-xl border-2 border-[#1A1A1A] bg-white flex flex-col items-center justify-center gap-1.5 shadow-[2px_2px_0_#1A1A1A]"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[#1A1A1A] rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#1A1A1A] rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#1A1A1A] rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown — floats over page */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 border-t-2 border-[#1A1A1A] bg-white px-5 py-4 flex flex-col gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Features",     href: "#features" },
              { label: "FAQ",          href: "#faq" },
              { label: "Pricing",      href: "#pricing" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-bold text-[#1A1A1A] py-3 border-b border-[#F2EFE9] last:border-0 hover:text-[#E8682A] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); handleBuy(); }}
              disabled={buying}
              className="btn-orange mt-3 py-3 text-center text-sm"
            >
              Get Started — $19
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="px-6 sm:px-10 pt-12 pb-28 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E0DBD3] text-[#2D6A4F] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <path d="M8 3v18M16 3v5"/>
              </svg>
              Snap. Cook. Done.
            </div>

            <h1 className="heading-chunky text-5xl sm:text-6xl leading-[1.05] mb-6">
              Turn your fridge
              <br />
              into{" "}
              <span className="text-[#2D6A4F]">tonight&apos;s
              <br />dinner</span>
            </h1>

            <p className="body-mono text-[#6B6B6B] max-w-md mb-8">
              Snap a photo of your fridge or type what you have — FridgeFlow
              instantly identifies your ingredients and suggests practical,
              delicious recipes. Waste less food and skip the
              &quot;what should I cook?&quot; stress.
            </p>

            <div className="flex flex-wrap gap-3 mb-5">
              <button onClick={handleBuy} disabled={buying} className="btn-orange flex items-center gap-2 px-6 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Get Started — $7
              </button>
              <a href="#how-it-works" className="btn-green-outline flex items-center gap-2 px-6 py-3.5">
                See how it works
              </a>
            </div>

            <p className="body-mono text-[#9A9A9A] text-xs">
              One-time payment. No subscriptions. Ever.
            </p>
          </div>

          {/* Right — fridge graphic */}
          <div className="flex justify-center lg:justify-end pt-8 pb-4">
            <HeroGraphic />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white border-t border-[#E0DBD3] px-6 sm:px-10 py-28">
        <div className="max-w-5xl mx-auto">

          {/* Label + heading */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-20">
            <div>
              <p className="text-xs font-bold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">How it works</p>
              <h2 className="heading-chunky text-4xl sm:text-5xl leading-[1.05]">
                From fridge to fork
                <br />
                <span className="text-[#9A9A9A]" style={{WebkitTextStroke: "2px #C0BAB0"}}>in three steps.</span>
              </h2>
            </div>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="hidden sm:block absolute top-[28px] left-[calc(16.6%+12px)] right-[calc(16.6%+12px)] h-px bg-[#E0DBD3]" />

            <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
              {[
                {
                  step: "01",
                  emoji: "📸",
                  title: "Snap or type your ingredients",
                  desc: "Point your camera at the fridge and we'll detect what's inside — or type it manually. Either way, FridgeFlow doesn't judge.",
                  detail: "Camera scan or text input",
                },
                {
                  step: "02",
                  emoji: "✨",
                  title: "AI builds your menu",
                  desc: "Our AI cross-references your ingredients and returns 3 practical, under-30-minute meals.",
                  detail: "Powered by GPT-4o",
                },
                {
                  step: "03",
                  emoji: "🍽️",
                  title: "Cook without thinking",
                  desc: "Step-by-step instructions, difficulty ratings, and exactly what (if anything) you still need to grab.",
                  detail: "Max 6 steps per recipe",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative flex flex-col">
                  {/* Step bubble */}
                  <div className="flex items-center gap-4 mb-7">
                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#F2EFE9] border-2 border-[#E0DBD3] flex items-center justify-center text-2xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#C0BAB0] tracking-widest uppercase">Step</span>
                      <span className="text-[11px] font-black text-[#2D6A4F] tracking-widest">{item.step}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight mb-3">{item.title}</h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed mb-5 flex-1">{item.desc}</p>

                  {/* Detail chip */}
                  <div className="inline-flex items-center gap-1.5 bg-[#F2EFE9] border border-[#E0DBD3] text-[#9A9A9A] text-[11px] font-semibold px-3 py-1.5 rounded-full self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 max-w-5xl mx-auto px-6 sm:px-10 space-y-32">

        {/* Feature 1 — text left, mockup right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-chunky text-3xl sm:text-4xl leading-tight mb-5">
              Snap your fridge,<br />skip the typing
            </h2>
            <p className="body-mono text-[#6B6B6B] mb-8">
              On mobile, just open your camera, point it at the fridge or pantry, and FridgeFlow scans the photo — detecting your ingredients automatically. No typing, no guessing, no fridge staring.
            </p>
            <ul className="space-y-3">
              {[
                "Camera scan on any phone",
                "Auto-detects pantry staples",
                "Prefer typing? That works too",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 body-mono text-sm text-[#1A1A1A]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#E8D84A] border-2 border-[#1A1A1A] flex items-center justify-center shrink-0">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup: camera scan result */}
          <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl overflow-hidden shadow-[6px_6px_0px_#1A1A1A]">
            <div className="h-1.5 bg-[#E8682A]" />
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">🔍</span>
                <div>
                  <p className="font-extrabold text-[#1A1A1A] text-base">Fridge report</p>
                  <p className="text-[#9A9A9A] text-[10px] font-mono">No judgment (lie).</p>
                </div>
              </div>
              {/* Vibe */}
              <div className="bg-[#FFF8E8] border border-[#E8682A]/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-[#B45309] text-xs font-mono italic">&ldquo;Actually impressive. Are you a chef or just anxious?&rdquo;</p>
              </div>
              {/* Detected items */}
              <p className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest mb-2">Items detected</p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {["chicken", "garlic", "olive oil", "lemon", "spinach"].map((item) => (
                  <span key={item} className="text-xs text-[#2D6A4F] bg-[#D8F3DC]/60 border border-[#2D6A4F]/15 px-2.5 py-1 rounded-full font-medium capitalize">
                    {item}
                  </span>
                ))}
              </div>
              {/* CTA */}
              <button className="w-full bg-[#2D6A4F] border-2 border-[#1A1A1A] text-white font-bold text-sm py-2.5 rounded-xl shadow-[2px_2px_0_#1A1A1A]">
                Generate full recipes from these →
              </button>
            </div>
          </div>
        </div>

        {/* Feature 2 — mockup left, text right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Mockup: recipe results (dark card, like leaderboard) */}
          <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[24px] overflow-hidden shadow-[6px_6px_0px_#1A1A1A] order-2 lg:order-1">
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
              <p className="text-xs font-bold text-[#95D5B2] uppercase tracking-widest">Your Recipes</p>
              <span className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28C840] animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { n: 1, name: "Cheesy Scrambled Egg Toast", time: "8 min", diff: "Easy", emoji: "🍳" },
                { n: 2, name: "Garlic Butter Pasta",         time: "15 min", diff: "Easy", emoji: "🍝" },
                { n: 3, name: "Egg & Cheese Quesadilla",     time: "12 min", diff: "Easy", emoji: "🫔" },
              ].map((r) => (
                <div key={r.n} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-white/20 font-mono text-sm w-4">{r.n}</span>
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-white/30 text-xs font-mono">{r.diff}</p>
                  </div>
                  <span className="text-[#E8D84A] text-xs font-bold font-mono shrink-0">{r.time}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-white/10">
              <p className="text-white/20 text-[10px] font-mono text-center">Generated from: eggs, cheese, bread, garlic</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="heading-chunky text-3xl sm:text-4xl leading-tight mb-5">
              Get 3 real recipes instantly
            </h2>
            <p className="body-mono text-[#6B6B6B] mb-8">
              FridgeFlow returns exactly three recipes — not 47. Each one uses what you already have, keeps missing ingredients minimal, and never asks you to sous vide anything.
            </p>
            <ul className="space-y-3">
              {[
                "Sorted by fewest missing ingredients",
                "Difficulty rated Easy, Moderate, or Hard",
                "Every recipe under 30 minutes",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 body-mono text-sm text-[#1A1A1A]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#E8D84A] border-2 border-[#1A1A1A] flex items-center justify-center shrink-0">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 3 — text left, mockup right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-chunky text-3xl sm:text-4xl leading-tight mb-5">
              Cook it step by step
            </h2>
            <p className="body-mono text-[#6B6B6B] mb-8">
              Each recipe comes with clear, numbered steps — six max. No "fold in the cheese" ambiguity. Just straightforward instructions written for people who are hungry, not chefs.
            </p>
            <ul className="space-y-3">
              {[
                "Max 6 steps per recipe",
                "Exact quantities, no guessing",
                "Slight personality included, free of charge",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 body-mono text-sm text-[#1A1A1A]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#E8D84A] border-2 border-[#1A1A1A] flex items-center justify-center shrink-0">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup: step-by-step view */}
          <div className="bg-white border-2 border-[#1A1A1A] rounded-[24px] overflow-hidden shadow-[6px_6px_0px_#1A1A1A]">
            <div className="bg-[#2D6A4F] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Cheesy Scrambled Egg Toast</p>
                <p className="text-[#95D5B2] text-xs font-mono mt-0.5">⚡ 8 min · Easy</p>
              </div>
              <span className="text-2xl">🍳</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { step: 1, text: "Crack 2 eggs into a bowl and whisk with a pinch of salt.", done: true },
                { step: 2, text: "Toast your bread until golden. Butter it immediately.", done: true },
                { step: 3, text: "Scramble eggs over medium-low heat, stirring constantly.", done: false },
                { step: 4, text: "Pull off heat while still slightly wet — they finish cooking.", done: false },
              ].map((s) => (
                <div key={s.step} className={`flex gap-3 p-3 rounded-xl border ${s.done ? "bg-[#F0FAF4] border-[#2D6A4F]/20" : "bg-[#F8F8F8] border-[#E0DBD3]"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${s.done ? "bg-[#2D6A4F] text-white" : "bg-[#E0DBD3] text-[#9A9A9A]"}`}>
                    {s.done ? "✓" : s.step}
                  </span>
                  <p className={`text-xs font-mono leading-relaxed ${s.done ? "text-[#2D6A4F] line-through opacity-60" : "text-[#1A1A1A]"}`}>
                    {s.text}
                  </p>
                </div>
              ))}
              <p className="text-center text-[10px] text-[#C0BAB0] font-mono pt-1">
                + 2 more steps
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Why section */}
      <section className="bg-[#1A1A1A] text-white px-6 sm:px-10 py-28 relative overflow-hidden">
        {/* Subtle texture circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2D6A4F]/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#2D6A4F]/10 blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-5xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <p className="text-xs font-bold text-[#2D6A4F] uppercase tracking-[0.2em] mb-4">Why FridgeFlow</p>
              <h2 className="heading-chunky text-4xl sm:text-5xl leading-[1.05] mb-6">
                You&apos;re not bad
                <br />at cooking.
                <br />
                <span className="text-[#40916C]" style={{WebkitTextStroke: "2px #2D6A4F"}}>You&apos;re just tired.</span>
              </h2>
              <p className="body-mono text-white/50 mb-10">
                Opening the fridge twelve times hoping something will change is
                not a meal plan. FridgeFlow takes what you actually have and
                gives you three simple, realistic options — in under 30 minutes.
              </p>
              <a href="#pricing" className="btn-green inline-flex items-center gap-2 px-7 py-4 text-sm">
                Start cooking smarter →
              </a>
            </div>

            {/* Right — stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "< 30s", label: "to generate your meals", icon: "⚡" },
                { value: "3", label: "realistic recipes every time", icon: "🍽️" },
                { value: "0", label: "unnecessary ingredients", icon: "🧠" },
                { value: "∞", label: "generations with lifetime plan", icon: "♾️" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <div className="text-3xl font-extrabold mb-1">{item.value}</div>
                  <div className="text-white/40 text-xs leading-relaxed">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 sm:px-10 py-24 max-w-lg mx-auto">
        <div className="bg-white border border-[#E0DBD3] rounded-3xl p-8 sm:p-10 text-center shadow-sm">
          <div className="inline-flex items-center gap-1.5 bg-[#FFF3CD] border border-[#FFD966]/40 text-[#B45309] text-xs font-semibold px-3 py-1 rounded-full mb-6">
            🔥 Early access pricing
          </div>
          <div className="heading-chunky text-7xl mb-2 text-[#1A1A1A]">$7</div>
          <div className="body-mono text-[#6B6B6B] text-sm mb-1">Lifetime access</div>
          <div className="body-mono text-[#9A9A9A] text-xs mb-8">One time. No subscription. No surprises.</div>
          <ul className="text-sm text-[#6B6B6B] space-y-3 mb-8 text-left">
            {[
              "Unlimited meal generations",
              "All future recipes & improvements",
              "Works on any device",
              "One less excuse to order takeout",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D8F3DC] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button onClick={handleBuy} disabled={buying} className="btn-orange w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none">
            {buying ? "Redirecting to checkout..." : "Unlock Unlimited Meals"}
          </button>
          {buyError && (
            <p className="body-mono text-red-500 text-xs text-center mt-3">{buyError}</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 sm:px-10 py-24 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="heading-chunky text-4xl sm:text-5xl leading-tight">
            Questions you&apos;re
            <br />
            <span className="text-[#9A9A9A]" style={{WebkitTextStroke: "2px #C0BAB0"}}>probably thinking.</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0DBD3] px-6 sm:px-10 pt-16 pb-8">
        <div className="max-w-5xl mx-auto">

          {/* Top row */}
          <div className="grid sm:grid-cols-4 gap-10 pb-12 border-b border-[#E0DBD3]">

            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/fridgeflow-logo-removebg-preview.png" alt="FridgeFlow logo" className="w-10 h-10 object-contain" />
                <span className="font-extrabold text-[#1A1A1A] text-lg tracking-tight">FridgeFlow</span>
              </div>
              <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-xs mb-6">
                Turn whatever's in your fridge into an actual meal. AI-generated
                recipes in under 30 seconds. No account. No stress.
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-5">Product</p>
              <ul className="space-y-3">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Features",     href: "#features" },
                  { label: "Pricing",      href: "#pricing" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#2D6A4F] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info links */}
            <div>
              <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-5">Info</p>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy",    href: "#" },
                  { label: "Terms of Service",  href: "#" },
                  { label: "Contact",           href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#2D6A4F] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="body-mono text-xs text-[#C0BAB0]">
              © {new Date().getFullYear()} FridgeFlow. Built with AI & mild desperation.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#C0BAB0]">
              <span className="w-2 h-2 rounded-full bg-[#28C840] animate-pulse" />
              All systems operational
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
