"use client";

import React from "react";
import { Language, getTranslation } from "@/locales";
import { ShieldCheck, Sparkles, Globe, Lock } from "lucide-react";

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenPricing: () => void;
  invoicesCreated: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenPricing,
  invoicesCreated,
}) => {
  const t = getTranslation(currentLang);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
      {/* Trust & GDPR Top Banner */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.trustBadge}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-slate-300">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            Client-Side Sandbox
          </span>
          <span>•</span>
          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold">
            EN 16931-1:2017 Ready
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-xl">
            🇪🇺
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Euro<span className="text-blue-600">Bill</span>
                <span className="text-xs ml-1 bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">
                  XML
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Right Actions: Lang Switcher & Pro Upgrade */}
        <div className="flex items-center space-x-3">
          {/* Usage counter badge */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Free Quota: <strong>{invoicesCreated}/2</strong></span>
          </div>

          {/* Language Switcher DE / EN / FR */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange("de")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentLang === "de"
                  ? "bg-white text-blue-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Deutsch"
            >
              🇩🇪 DE
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentLang === "en"
                  ? "bg-white text-blue-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => onLanguageChange("fr")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentLang === "fr"
                  ? "bg-white text-blue-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Français"
            >
              🇫🇷 FR
            </button>
          </div>

          {/* Pricing / Pro Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.nav.pricing}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

