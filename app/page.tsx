"use client";

import React, { useState, useEffect } from "react";
import { Language, getTranslation } from "@/locales";
import { Header } from "@/components/Header";
import { InvoiceViewer } from "@/components/InvoiceViewer";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { CompanyProfileArchive, SavedInvoice } from "@/components/CompanyProfileArchive";
import { PaywallModal } from "@/components/PaywallModal";
import { Footer } from "@/components/Footer";
import { LegalModals, LegalModalType } from "@/components/LegalModals";
import { Eye, PlusCircle, FolderArchive, Sparkles } from "lucide-react";

export default function Home() {
  const [currentLang, setCurrentLang] = useState<Language>("de");
  const [activeTab, setActiveTab] = useState<"viewer" | "generator" | "archive">("viewer");
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Persistence in LocalStorage
  const [invoicesCreated, setInvoicesCreated] = useState<number>(0);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [profile, setProfile] = useState({
    companyName: "Acme European Solutions GmbH",
    street: "Kurfürstendamm 194",
    postalCity: "10707 Berlin",
    vatId: "DE309876543",
    iban: "DE89370400440532013000",
    bic: "DBDETTBBXXX",
  });

  const t = getTranslation(currentLang);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem("eurobill_invoice_count");
      if (storedCount) setInvoicesCreated(parseInt(storedCount, 10));

      const storedInvoices = localStorage.getItem("eurobill_invoices");
      if (storedInvoices) setSavedInvoices(JSON.parse(storedInvoices));

      const storedProfile = localStorage.getItem("eurobill_profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedLang = localStorage.getItem("eurobill_lang") as Language;
      if (storedLang && ["de", "en", "fr"].includes(storedLang)) {
        setCurrentLang(storedLang);
      }
    } catch (e) {
      console.warn("LocalStorage access failed", e);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem("eurobill_lang", lang);
    } catch {}
  };

  const handleInvoiceCreated = () => {
    setInvoicesCreated((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("eurobill_invoice_count", next.toString());
      } catch {}
      return next;
    });
  };

  const handleSaveToArchive = (inv: {
    invoiceNumber: string;
    issueDate: string;
    buyerName: string;
    grossAmount: number;
    standard: string;
    xml: string;
  }) => {
    const newInvoice: SavedInvoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      buyerName: inv.buyerName,
      grossAmount: inv.grossAmount,
      standard: inv.standard,
      status: "pending",
      xml: inv.xml,
    };

    setSavedInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      try {
        localStorage.setItem("eurobill_invoices", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleStatus = (id: string) => {
    setSavedInvoices((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, status: (item.status === "paid" ? "pending" : "paid") as "paid" | "pending" }
          : item
      );
      try {
        localStorage.setItem("eurobill_invoices", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteInvoice = (id: string) => {
    setSavedInvoices((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("eurobill_invoices", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem("eurobill_profile", JSON.stringify(newProfile));
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenPricing={() => setIsPaywallOpen(true)}
        invoicesCreated={invoicesCreated}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Navigation Tabs (Viewer / Generator / Archive) */}
        <div className="flex justify-center no-print">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-inner">
            <button
              onClick={() => setActiveTab("viewer")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "viewer"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t.nav.viewer}</span>
            </button>

            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "generator"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.generator}</span>
            </button>

            <button
              onClick={() => setActiveTab("archive")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "archive"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>{t.nav.archive}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: XML Viewer */}
        {activeTab === "viewer" && (
          <InvoiceViewer currentLang={currentLang} />
        )}

        {/* Tab 2: Invoice Generator */}
        {activeTab === "generator" && (
          <InvoiceGenerator
            currentLang={currentLang}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            invoicesCreated={invoicesCreated}
            onInvoiceCreated={handleInvoiceCreated}
            onSaveToArchive={handleSaveToArchive}
            initialProfile={profile}
          />
        )}

        {/* Tab 3: Archive & Company Profile */}
        {activeTab === "archive" && (
          <CompanyProfileArchive
            currentLang={currentLang}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            invoices={savedInvoices}
            onToggleStatus={handleToggleStatus}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onOpenLegalModal={(type) => setLegalModalType(type)}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        currentLang={currentLang}
      />

      {/* Legal & Revocation Modal (§ 312k BGB) */}
      <LegalModals
        modalType={legalModalType}
        onClose={() => setLegalModalType(null)}
        currentLang={currentLang}
      />
    </div>
  );
}

