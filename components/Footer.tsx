"use client";

import React from "react";
import { Language, getTranslation } from "@/locales";
import { LegalModalType } from "./LegalModals";
import { Lock, FileText, Shield, ExternalLink } from "lucide-react";

interface FooterProps {
  currentLang: Language;
  onOpenLegalModal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenLegalModal,
}) => {
  const t = getTranslation(currentLang);

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-base font-bold text-white tracking-tight">
                Euro<span className="text-blue-400">Bill</span> XML
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800">
                EU Directive 2014/55/EU
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              {t.footer.rights}
            </p>
            <p className="text-slate-500 text-[11px] flex items-center justify-center md:justify-start gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              {t.footer.localProcessing}
            </p>
          </div>

          {/* Mandatory German/EU Legal Links & Kündigungsbutton */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => onOpenLegalModal("impressum")}
              className="text-slate-300 hover:text-white transition"
            >
              {t.legal.impressum}
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onOpenLegalModal("gdpr")}
              className="text-slate-300 hover:text-white transition"
            >
              {t.legal.gdpr}
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onOpenLegalModal("terms")}
              className="text-slate-300 hover:text-white transition"
            >
              {t.legal.terms}
            </button>
            <span className="text-slate-700">•</span>

            {/* § 312k BGB Kündigungsbutton (Legally mandatory in Germany) */}
            <button
              onClick={() => onOpenLegalModal("cancel")}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-red-950 text-red-300 hover:text-red-200 border border-slate-700 transition font-medium"
            >
              {t.legal.cancelButton}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 EuroBill XML — Built for XRechnung 3.0, ZUGFeRD 2.2, Factur-X & Peppol BIS 3.0.</p>
          <div className="flex items-center space-x-3">
            <span>🇩🇪 DE</span>
            <span>🇫🇷 FR</span>
            <span>🇧🇪 BE</span>
            <span>🇳🇱 NL</span>
            <span>🇦🇹 AT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

