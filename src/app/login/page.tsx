"use client";

import React from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex-grow flex items-center justify-center px-4 py-24">
      <div className="codex-card max-w-md w-full p-8 rounded-lg text-center relative border border-gold/20 shadow-2xl bg-black/60 backdrop-blur-md">
        {/* Decorative corner lines */}
        <div className="absolute top-2 left-2 border-t border-l border-gold/30 w-3.5 h-3.5"></div>
        <div className="absolute top-2 right-2 border-t border-r border-gold/30 w-3.5 h-3.5"></div>
        <div className="absolute bottom-2 left-2 border-b border-l border-gold/30 w-3.5 h-3.5"></div>
        <div className="absolute bottom-2 right-2 border-b border-r border-gold/30 w-3.5 h-3.5"></div>

        <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8 text-gold animate-spin-slow" strokeWidth={1.5} />
        </div>

        <div className="inline-flex items-center gap-1.5 border border-gold/30 bg-gold/5 px-2.5 py-0.5 rounded-full text-[10px] text-gold font-serif mb-2">
          <Sparkles className="w-3 h-3" />
          <span>Waloński Kodex</span>
        </div>

        <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide mb-1">
          Prospector's Portal
        </h1>
        <p className="text-xs text-gold/70 font-serif italic mb-6">
          Access restricted to the Grand Master Prospector
        </p>

        <p className="text-xs text-gray-400 leading-relaxed mb-6 px-4">
          Sign in with your authorized Google account to log dog walks, manage active tumbling batches, and generate shop provenance card records.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gold/30 hover:border-gold bg-black/40 hover:bg-gold/5 text-white hover:text-gold rounded text-sm font-semibold transition cursor-pointer shadow-lg"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-8 border-t border-white/5 pt-4">
          <Link
            href="/"
            className="text-[10px] text-gray-500 hover:text-gold transition font-sans"
          >
            ← Return to public codex
          </Link>
        </div>
      </div>
    </div>
  );
}
