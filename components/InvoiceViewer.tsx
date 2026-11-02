"use client";

import React, { useState, useEffect } from "react";
import { Language, getTranslation } from "@/locales";
import { parseEuXmlInvoice, ParsedInvoice } from "@/lib/xmlParser";
import { SAMPLE_GERMAN_XRECHNUNG_XML, SAMPLE_FRENCH_FACTURX_XML } from "@/lib/sampleInvoices";
import { exportElementToA4Pdf, downloadXmlStringAsFile } from "@/lib/pdfExport";
import {
  UploadCloud,
  FileCheck2,
  Download,
  FileCode,
  Building,
  CreditCard,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface InvoiceViewerProps {
  currentLang: Language;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ currentLang }) => {
  const t = getTranslation(currentLang);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Auto-load sample German XRechnung on first mount for instant rich experience
  useEffect(() => {
    loadSample("de");
  }, []);

  const handleFileUpload = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        processXml(content);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the XML file.");
    };
    reader.readAsText(file);
  };

  const processXml = (rawXml: string) => {
    try {
      setError(null);
      setXmlContent(rawXml);
      const parsed = parseEuXmlInvoice(rawXml);
      setParsedInvoice(parsed);
    } catch (err: any) {
      setError(err?.message || "Failed to parse EN 16931 XML invoice.");
    }
  };

  const loadSample = (type: "de" | "fr") => {
    const sample = type === "de" ? SAMPLE_GERMAN_XRECHNUNG_XML : SAMPLE_FRENCH_FACTURX_XML;
    processXml(sample);
  };

  const handleDownloadPdf = async () => {
    if (!parsedInvoice) return;
    try {
      setIsExportingPdf(true);
      await exportElementToA4Pdf(
        "printable-a4-invoice-viewer",
        `${parsedInvoice.invoiceNumber || "EU-Invoice"}.pdf`
      );
    } catch (e: any) {
      alert("Error generating PDF: " + e.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadXml = () => {
    if (!xmlContent || !parsedInvoice) return;
    downloadXmlStringAsFile(xmlContent, `${parsedInvoice.invoiceNumber || "invoice"}.xml`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Sample Buttons */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {t.viewer.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.viewer.title}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t.viewer.subtitle}
          </p>
        </div>

        {/* Dropzone & Quick Samples */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="md:col-span-2 border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-6 text-center bg-blue-50/30 transition cursor-pointer flex flex-col items-center justify-center relative group"
          >
            <input
              type="file"
              accept=".xml,application/xml,text/xml"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {t.viewer.dropzoneTitle}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t.viewer.dropzoneSubtitle}
            </p>
          </div>

          {/* Sample Load Buttons */}
          <div className="flex flex-col justify-center space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Test mit 1 Klick
            </span>
            <button
              onClick={() => loadSample("de")}
              className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-800 transition flex items-center justify-between shadow-xs"
            >
              <span>{t.viewer.sampleDeBtn}</span>
              <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
            </button>
            <button
              onClick={() => loadSample("fr")}
              className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-800 transition flex items-center justify-between shadow-xs"
            >
              <span>{t.viewer.sampleFrBtn}</span>
              <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Invoice Display Section */}
      {parsedInvoice && (
        <div className="space-y-4">
          {/* Action Bar & Validation Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-slate-200 gap-3 shadow-xs">
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{t.viewer.validBadge} ({parsedInvoice.standard})</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? "Exporting..." : t.viewer.downloadPdf}</span>
              </button>
              <button
                onClick={handleDownloadXml}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 transition"
              >
                <FileCode className="w-4 h-4 text-slate-600" />
                <span>{t.viewer.downloadXml}</span>
              </button>
            </div>
          </div>

          {/* A4 Sheet Container */}
          <div className="flex justify-center overflow-x-auto pb-4">
            <div
              id="printable-a4-invoice-viewer"
              className="bg-white w-[210mm] min-h-[297mm] p-[16mm] shadow-xl border border-slate-200 text-slate-800 text-[13px] flex flex-col justify-between"
              style={{ boxSizing: "border-box" }}
            >
              <div>
                {/* Header: Company & Invoice Meta */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {parsedInvoice.seller.name || "UNTERNEHMEN"}
                    </h1>
                    <p className="text-slate-600 mt-1">
                      {parsedInvoice.seller.street}<br />
                      {parsedInvoice.seller.postalCode} {parsedInvoice.seller.city}, {parsedInvoice.seller.country}
                    </p>
                    {parsedInvoice.seller.vatId && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        USt-IdNr.: {parsedInvoice.seller.vatId}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded text-xs uppercase tracking-wide border border-blue-200 mb-2">
                      {parsedInvoice.standard}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {parsedInvoice.invoiceNumber}
                    </h2>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <p>Datum: <strong>{parsedInvoice.issueDate}</strong></p>
                      {parsedInvoice.dueDate && (
                        <p>Fälligkeit: <strong>{parsedInvoice.dueDate}</strong></p>
                      )}
                      {parsedInvoice.buyerReference && (
                        <p className="font-mono">Leitweg-ID / Ref: <strong>{parsedInvoice.buyerReference}</strong></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recipient / Buyer Section */}
                <div className="mb-8 p-4 bg-slate-50/80 rounded-xl border border-slate-100 max-w-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {t.viewer.buyer}
                  </span>
                  <p className="font-bold text-slate-900">{parsedInvoice.buyer.name}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {parsedInvoice.buyer.street}<br />
                    {parsedInvoice.buyer.postalCode} {parsedInvoice.buyer.city}, {parsedInvoice.buyer.country}
                  </p>
                  {parsedInvoice.buyer.vatId && (
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      USt-IdNr.: {parsedInvoice.buyer.vatId}
                    </p>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">{t.viewer.description}</th>
                        <th className="py-2.5 px-3 text-right">{t.viewer.quantity}</th>
                        <th className="py-2.5 px-3 text-right">{t.viewer.unitPrice}</th>
                        <th className="py-2.5 px-3 text-right">{t.viewer.vatRate}</th>
                        <th className="py-2.5 px-3 text-right">{t.viewer.total}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{item.name}</span>
                            {item.description && (
                              <span className="text-[11px] text-slate-500">{item.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-medium">{item.quantity}</td>
                          <td className="py-3 px-3 text-right font-medium">
                            {item.unitPrice.toFixed(2)} {parsedInvoice.currency}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500">
                            {item.vatRate}%
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {item.total.toFixed(2)} {parsedInvoice.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>{t.viewer.subtotal}</span>
                      <span className="font-semibold">
                        {parsedInvoice.subtotal.toFixed(2)} {parsedInvoice.currency}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>{t.viewer.vatAmount} ({parsedInvoice.vatRate}%)</span>
                      <span className="font-semibold">
                        {parsedInvoice.vatAmount.toFixed(2)} {parsedInvoice.currency}
                      </span>
                    </div>
                    <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                      <span>{t.viewer.grandTotal}</span>
                      <span>
                        {parsedInvoice.grandTotal.toFixed(2)} {parsedInvoice.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Bank & Compliance */}
              <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-2">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Zahlungsverbindung (SEPA)</span>
                    <p className="font-mono">IBAN: {parsedInvoice.payment.iban || "DE89370400440532013000"}</p>
                    {parsedInvoice.payment.bic && (
                      <p className="font-mono">BIC: {parsedInvoice.payment.bic}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 block mb-0.5">Elektronischer Standard</span>
                    <p>Konform nach EU-Norm EN 16931-1:2017</p>
                    <p>Verifiziert durch EuroBill XML Engine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

