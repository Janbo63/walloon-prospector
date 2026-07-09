"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/translations/context";
import { Compass, Camera, Upload, ArrowLeft, Loader2, Sparkles } from "lucide-react";

interface ScanResult {
  name: string;
  description: string;
  composition: string;
  lore: string;
}

export default function Scanner() {
  const { t, language, setLanguage } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleScan = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", "visitor");
    formData.append("lang", language);

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the stone. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/15 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold" />
            <span className="font-serif font-bold text-lg text-gold gold-text-glow tracking-wide">
              {t.common.title}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 border border-gold/20 bg-black/50 px-2 py-1 rounded text-xs">
              {["en", "pl", "cs"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === lang ? "bg-gold text-black font-semibold" : "text-gray-400 hover:text-gold"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full flex flex-col items-center">
        {/* Back Button */}
        <div className="w-full mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gold/80 hover:text-gold transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.common.back}</span>
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 text-center flex items-center gap-2">
          {t.public.scanner.title}
        </h1>
        <p className="text-xs text-gray-400 text-center mb-8 max-w-md">
          {t.public.scanner.instruction}
        </p>

        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={handleImageChange}
        />

        {/* Upload Buttons */}
        <div className="flex gap-4 mb-8 w-full max-w-md justify-center">
          <button
            onClick={triggerCamera}
            className="flex-1 flex flex-col items-center gap-2 border border-gold/20 hover:border-gold/50 bg-black/40 hover:bg-gold/5 py-4 px-3 rounded-lg text-gold transition cursor-pointer text-xs font-serif shadow-lg"
          >
            <Camera className="w-6 h-6" />
            <span>{t.public.scanner.takePhotoBtn}</span>
          </button>

          <button
            onClick={triggerFileSelect}
            className="flex-1 flex flex-col items-center gap-2 border border-gold/20 hover:border-gold/50 bg-black/40 hover:bg-gold/5 py-4 px-3 rounded-lg text-gold transition cursor-pointer text-xs font-serif shadow-lg"
          >
            <Upload className="w-6 h-6" />
            <span>{t.public.scanner.uploadBtn}</span>
          </button>
        </div>

        {/* Image Preview & Scan Action */}
        {image && (
          <div className="w-full max-w-md flex flex-col items-center mb-8">
            <div className="relative border border-gold/30 rounded-lg overflow-hidden w-full aspect-video bg-black/50 shadow-2xl mb-4">
              <img src={image} alt="Upload Preview" className="w-full h-full object-contain" />
            </div>

            {!loading && !result && (
              <button
                onClick={handleScan}
                className="w-full py-3 bg-gold hover:bg-gold-light text-black font-semibold text-sm rounded shadow-lg transition font-serif cursor-pointer"
              >
                {t.public.scanner.scanBtn}
              </button>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
            <p className="text-xs text-gold font-serif italic animate-pulse">
              Invoking the Alchemist's lens...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="w-full max-w-md border border-red-500/20 bg-red-950/20 text-red-300 p-4 rounded text-xs mb-8 text-center">
            {error}
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className="w-full max-w-md parchment-card p-6 rounded-lg mb-8 relative overflow-hidden">
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-gold-dark/40 w-4 h-4"></div>
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-gold-dark/40 w-4 h-4"></div>
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-gold-dark/40 w-4 h-4"></div>
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-gold-dark/40 w-4 h-4"></div>

            <div className="text-center mb-4 border-b border-gold-dark/20 pb-3">
              <div className="inline-flex items-center gap-1 text-[10px] text-gold-dark font-serif uppercase tracking-widest mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Walloon Discovery</span>
              </div>
              <h2 className="text-xl font-serif font-black tracking-wide text-gold-dark">
                {result.name}
              </h2>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h3 className="font-serif font-bold text-gold-dark border-b border-gold-dark/10 pb-0.5 mb-1 uppercase tracking-wider text-[10px]">
                  Description
                </h3>
                <p className="text-[#3b301c]">{result.description}</p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-gold-dark border-b border-gold-dark/10 pb-0.5 mb-1 uppercase tracking-wider text-[10px]">
                  {t.public.scanner.composition}
                </h3>
                <p className="text-[#3b301c] italic font-semibold">{result.composition}</p>
              </div>

              <div className="bg-[#f0e3c7]/60 p-3 rounded border border-[#cbbb9d] italic shadow-inner">
                <h3 className="font-serif font-black text-gold-dark not-italic mb-1 uppercase tracking-wider text-[10px]">
                  {t.public.scanner.lore}
                </h3>
                <p className="text-[#42351f] font-serif leading-relaxed">
                  "{result.lore}"
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-4 text-center text-[10px] text-gray-500 font-sans mt-auto">
        <p>© 2026 Zagroda Alpakoterapii — Project Prospector. All rights reserved.</p>
      </footer>
    </div>
  );
}
