"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/translations/context";
import { Sparkles, Compass, Eye, Map, LogIn } from "lucide-react";

export default function Home() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="border-b border-gold/15 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold animate-pulse" />
            <span className="font-serif font-bold text-lg text-gold gold-text-glow tracking-wide">
              {t.common.title}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 border border-gold/20 bg-black/50 px-2 py-1 rounded text-xs">
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === "en" ? "bg-gold text-black font-semibold" : "text-gray-400 hover:text-gold"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("pl")}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === "pl" ? "bg-gold text-black font-semibold" : "text-gray-400 hover:text-gold"
                }`}
              >
                PL
              </button>
              <button
                onClick={() => setLanguage("cs")}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === "cs" ? "bg-gold text-black font-semibold" : "text-gray-400 hover:text-gold"
                }`}
              >
                CS
              </button>
            </div>

            {/* Admin Portal Link */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold border border-gold/30 hover:border-gold px-2.5 py-1 rounded transition bg-gold/5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.common.adminPortal}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 border border-gold/30 bg-gold/5 px-3 py-1 rounded-full text-xs text-gold font-serif mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Future Solutions AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 tracking-wide">
            {t.public.welcome}
          </h1>
          <p className="text-gold/70 font-serif italic text-sm md:text-base">
            {t.common.subtitle}
          </p>
        </div>

        {/* Action Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mb-14">
          {/* Eye of the Walloon (Scanner) */}
          <Link
            href="/scanner"
            className="codex-card p-6 rounded-lg text-center flex flex-col items-center justify-between group hover:scale-[1.02] active:scale-[0.98] animate-gold-glow"
          >
            <div className="w-14 h-14 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/25 transition">
              <Eye className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white mb-2">
                {t.public.scanner.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4 px-2 leading-relaxed">
                Scan rocks with your device's camera to identify minerals and read local folklore.
              </p>
            </div>
            <span className="w-full py-2 bg-gold hover:bg-gold-light text-black font-semibold text-sm rounded shadow transition font-serif">
              {t.public.scanButton}
            </span>
          </Link>

          {/* Interactive Tour Guide */}
          <Link
            href="/guide"
            className="codex-card p-6 rounded-lg text-center flex flex-col items-center justify-between group hover:scale-[1.02] active:scale-[0.98] border border-gold/10"
          >
            <div className="w-14 h-14 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/25 transition">
              <Compass className="w-7 h-7 text-gold animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white mb-2">
                {t.public.guide.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4 px-2 leading-relaxed">
                {t.public.guide.description}
              </p>
            </div>
            <span className="w-full py-2 border border-gold hover:bg-gold/10 text-gold font-semibold text-sm rounded transition font-serif">
              {t.public.guideButton}
            </span>
          </Link>

          {/* Lost Map */}
          <Link
            href="/map"
            className="codex-card p-6 rounded-lg text-center flex flex-col items-center justify-between group hover:scale-[1.02] active:scale-[0.98] border border-gold/10"
          >
            <div className="w-14 h-14 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/25 transition">
              <Map className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white mb-2">
                {t.public.map.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4 px-2 leading-relaxed">
                Explore local trails, history, and find where different minerals crop out.
              </p>
            </div>
            <span className="w-full py-2 border border-gold hover:bg-gold/10 text-gold font-semibold text-sm rounded transition font-serif">
              {t.public.mapButton}
            </span>
          </Link>
        </div>

        {/* Quick Lore Introduction */}
        <section className="bg-black/35 border border-white/5 rounded p-6 max-w-xl mx-auto text-center text-xs text-gray-300 leading-relaxed font-sans">
          <p>{t.public.description}</p>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/50 py-4 text-center text-[10px] text-gray-500 font-sans">
        <p>© 2026 Future Solutions AI — Walloon. All rights reserved.</p>
      </footer>
    </div>
  );
}
