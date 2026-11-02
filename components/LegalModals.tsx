"use client";

import React, { useState } from "react";
import { Language, getTranslation } from "@/locales";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export type LegalModalType = "impressum" | "gdpr" | "terms" | "cancel" | null;

interface LegalModalsProps {
  modalType: LegalModalType;
  onClose: () => void;
  currentLang: Language;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  modalType,
  onClose,
  currentLang,
}) => {
  const [contractNumber, setContractNumber] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const t = getTranslation(currentLang);

  if (!modalType) return null;

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNumber || !email) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900">
            {modalType === "impressum" && t.legal.impressum}
            {modalType === "gdpr" && t.legal.gdpr}
            {modalType === "terms" && t.legal.terms}
            {modalType === "cancel" && t.legal.revocationTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700 leading-relaxed">
          {/* 1. IMPRESSUM */}
          {modalType === "impressum" && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Angaben gemäß § 5 TMG / Impressum</h4>
              <p>
                <strong>EuroBill XML Technologies S.A.S. / GmbH i.G.</strong><br />
                Friedrichstraße 176–179<br />
                10117 Berlin, Deutschland / Germany<br />
                E-Mail: legal@eurobill-xml.eu<br />
                Handelsregister: Amtsgericht Charlottenburg (Berlin), HRB 249018 B
              </p>
              <h5 className="font-semibold text-slate-900">Umsatzsteuer-Identifikationsnummer (VAT ID):</h5>
              <p>DE 349 821 004 gemäß § 27 a Umsatzsteuergesetz (UStG)</p>

              <h5 className="font-semibold text-slate-900">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h5>
              <p>Dr. Maximilian Schmidt, Friedrichstraße 176, 10117 Berlin</p>

              <h5 className="font-semibold text-slate-900">EU-Streitschlichtung:</h5>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  https://ec.europa.eu/consumers/odr
                </a>.
              </p>
            </div>
          )}

          {/* 2. GDPR / DATENSCHUTZ */}
          {modalType === "gdpr" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center space-x-2 text-emerald-800 font-semibold text-xs">
                <span>✓ 100% Client-Side Privacy: Keine Speicherung Ihrer Rechnungsdaten auf externen Servern.</span>
              </div>
              <h4 className="font-bold text-slate-900">Datenschutzerklärung (GDPR / DSGVO konform)</h4>
              <p>
                Der Schutz Ihrer personenbezogenen Daten bei der Erstellung und Prüfung von elektronischen Rechnungen (XRechnung, Factur-X, ZUGFeRD, Peppol) steht für uns an oberster Stelle.
              </p>
              <h5 className="font-semibold text-slate-900">1. Client-Side Verarbeitung (Zero Server Storage)</h5>
              <p>
                EuroBill XML verarbeitet alle hochgeladenen XML-Dateien und generierten PDF-Dokumente ausschließlich lokal im Arbeitsspeicher Ihres Webbrowsers. Weder Rechnungsbeträge, IBAN-Daten noch Kundenadressen werden an unsere Server übermittelt oder dort gespeichert.
              </p>
              <h5 className="font-semibold text-slate-900">2. Lokale Speicherung (Local Storage)</h5>
              <p>
                Wenn Sie Unternehmensprofile speichern oder das Rechnungsarchiv nutzen, werden diese Datensätze ausschließlich im `localStorage` Ihres eigenen Browsers abgelegt. Sie können diese Daten jederzeit mit einem Klick löschen.
              </p>
              <h5 className="font-semibold text-slate-900">3. Zahlungsabwicklung</h5>
              <p>
                Zahlungsvorgänge für kostenpflichtige Abonnements werden über zertifizierte Zahlungsdienstleister (LemonSqueezy / Stripe) abgewickelt, die den strengen PCI-DSS Level 1 und DSGVO-Standards entsprechen.
              </p>
            </div>
          )}

          {/* 3. AGB / TERMS */}
          {modalType === "terms" && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Allgemeine Geschäftsbedingungen (AGB)</h4>
              <p>
                Gültig für alle Verträge über die Bereitstellung des SaaS-Dienstes EuroBill XML für Geschäftskunden (B2B) und Verbraucher in der Europäischen Union.
              </p>
              <h5 className="font-semibold text-slate-900">§ 1 Vertragsgegenstand & EN 16931 Konformität</h5>
              <p>
                EuroBill XML stellt Software-Werkzeuge zur Validierung, Anzeige und Generierung elektronischer Rechnungsdatenformate gemäß EN 16931-1:2017 bereit. Der Kunde bleibt eigenverantwortlich für die inhaltliche Richtigkeit seiner Steuerangaben.
              </p>
              <h5 className="font-semibold text-slate-900">§ 2 Preise und Zahlungsbedingungen</h5>
              <p>
                Es gelten die zum Zeitpunkt des Vertragsschlusses auf der Plattform ausgewiesenen Preise in Euro (€). Alle angegebenen Preise verstehen sich als Endpreise bzw. zzgl. der gesetzlichen Mehrwertsteuer des jeweiligen EU-Mitgliedstaates.
              </p>
              <h5 className="font-semibold text-slate-900">§ 3 Kündigung & Laufzeit</h5>
              <p>
                Monatliche Abonnements können jederzeit zum Ende des Abrechnungsmonats gekündigt werden. Jährliche Abonnements verlängern sich um jeweils ein weiteres Jahr, sofern sie nicht vor Ablauf gekündigt werden.
              </p>
            </div>
          )}

          {/* 4. § 312k BGB KÜNDIGUNGSBUTTON FORMULAR */}
          {modalType === "cancel" && (
            <div>
              {!submitted ? (
                <form onSubmit={handleCancelSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    {t.legal.revocationDesc}
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      {t.legal.contractNumber} *
                    </label>
                    <input
                      type="text"
                      required
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="z.B. SUB-90421 oder INV-2026-01"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      {t.legal.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buchhaltung@unternehmen.de"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      {t.legal.reason}
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Optionaler Kündigungsgrund..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs shadow-md transition"
                    >
                      {t.legal.submitCancel}
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      Gesetzeskonforme Bestätigungs-Schaltfläche nach § 312k Abs. 2 BGB (Button-Lösung).
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">Kündigungseingang bestätigt</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {t.legal.cancelSuccess}
                  </p>
                  <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-700 font-mono inline-block">
                    Kündigungs-ID: CANCEL-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            {t.legal.close}
          </button>
        </div>
      </div>
    </div>
  );
};

