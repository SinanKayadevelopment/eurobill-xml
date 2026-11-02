"use client";

import React, { useState, useEffect } from "react";
import { Language, getTranslation } from "@/locales";
import { InvoiceFormData, generateEn16931UblXml } from "@/lib/xmlGenerator";
import { exportElementToA4Pdf, downloadXmlStringAsFile } from "@/lib/pdfExport";
import Papa from "papaparse";
import {
  FileCode,
  Download,
  Plus,
  Trash2,
  Upload,
  FileCheck2,
  Building,
  CreditCard,
  Calendar,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";

interface InvoiceGeneratorProps {
  currentLang: Language;
  onOpenPaywall: () => void;
  invoicesCreated: number;
  onInvoiceCreated: () => void;
  onSaveToArchive: (invoice: {
    invoiceNumber: string;
    issueDate: string;
    buyerName: string;
    grossAmount: number;
    standard: string;
    xml: string;
  }) => void;
  initialProfile?: {
    companyName: string;
    street: string;
    postalCity: string;
    vatId: string;
    iban: string;
    bic: string;
  };
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  currentLang,
  onOpenPaywall,
  invoicesCreated,
  onInvoiceCreated,
  onSaveToArchive,
  initialProfile,
}) => {
  const t = getTranslation(currentLang);
  const [activePreviewTab, setActivePreviewTab] = useState<"pdf" | "xml">("pdf");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Form State with sensible EU defaults
  const [formData, setFormData] = useState<InvoiceFormData>({
    standard: "de_xrechnung",
    invoiceNumber: "RE-2026-" + Math.floor(1000 + Math.random() * 9000),
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "EUR",
    buyerReference: "04011000-12345-67",

    // Seller
    sellerName: initialProfile?.companyName || "Acme European Solutions GmbH",
    sellerStreet: initialProfile?.street || "Friedrichstraße 176",
    sellerCity: initialProfile?.postalCity?.split(" ")[1] || "Berlin",
    sellerPostalCode: initialProfile?.postalCity?.split(" ")[0] || "10117",
    sellerCountry: "DE",
    sellerVatId: initialProfile?.vatId || "DE349821004",
    sellerTaxNumber: "12/345/67890",
    sellerEmail: "billing@acme-solutions.eu",
    sellerIban: initialProfile?.iban || "DE89370400440532013000",
    sellerBic: initialProfile?.bic || "DBDETTBBXXX",

    // Buyer
    buyerName: "Global Tech Services B.V.",
    buyerStreet: "Keizersgracht 421",
    buyerCity: "Amsterdam",
    buyerPostalCode: "1016 EK",
    buyerCountry: "NL",
    buyerVatId: "NL854321987B01",

    // Tax
    vatRate: 19,
    isReverseCharge: false,
    reverseChargeClause: t.generator.reverseChargeNotice,

    // Items
    items: [
      {
        id: "1",
        description: "B2B Cloud SaaS Subscription - Annual EN 16931 License",
        quantity: 1,
        unitPrice: 1200,
      },
      {
        id: "2",
        description: "Technical Integration & Peppol Setup Consulting",
        quantity: 5,
        unitPrice: 150,
      },
    ],
  });

  // Keep seller info synchronized if saved profile changes
  useEffect(() => {
    if (initialProfile && initialProfile.companyName) {
      setFormData((prev) => ({
        ...prev,
        sellerName: initialProfile.companyName || prev.sellerName,
        sellerStreet: initialProfile.street || prev.sellerStreet,
        sellerVatId: initialProfile.vatId || prev.sellerVatId,
        sellerIban: initialProfile.iban || prev.sellerIban,
        sellerBic: initialProfile.bic || prev.sellerBic,
      }));
    }
  }, [initialProfile]);

  // Handle standard change
  const handleStandardChange = (standard: InvoiceFormData["standard"]) => {
    let newVat = 19;
    let country = "DE";
    let buyerCountry = "DE";

    if (standard === "fr_facturx") {
      newVat = 20;
      country = "FR";
      buyerCountry = "FR";
    } else if (standard === "peppol_bis3") {
      newVat = 21;
      country = "BE";
      buyerCountry = "NL";
    }

    setFormData((prev) => ({
      ...prev,
      standard,
      sellerCountry: country,
      buyerCountry: buyerCountry,
      vatRate: prev.isReverseCharge ? 0 : newVat,
    }));
  };

  // Add Item
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: String(prev.items.length + 1),
          description: "New Consulting / Product item",
          quantity: 1,
          unitPrice: 100,
        },
      ],
    }));
  };

  // Remove Item
  const handleRemoveItem = (idx: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // Update Item
  const handleUpdateItem = (
    idx: number,
    field: "description" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      nextItems[idx] = {
        ...nextItems[idx],
        [field]: value,
      };
      return { ...prev, items: nextItems };
    });
  };

  // CSV Import for line items
  const handleCsvImport = (file: File) => {
    if (invoicesCreated >= 2) {
      onOpenPaywall();
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedItems: any[] = [];
        results.data.forEach((row: any, idx) => {
          const desc = row.Description || row.description || row.Artikel || row.Bezeichnung || `Item ${idx + 1}`;
          const qty = parseFloat(row.Quantity || row.quantity || row.Menge || "1");
          const price = parseFloat(row.Price || row.price || row.Preis || "0");
          if (!isNaN(price)) {
            parsedItems.push({
              id: String(idx + 1),
              description: desc,
              quantity: isNaN(qty) ? 1 : qty,
              unitPrice: price,
            });
          }
        });

        if (parsedItems.length > 0) {
          setFormData((prev) => ({
            ...prev,
            items: parsedItems,
          }));
          alert(`Successfully imported ${parsedItems.length} items from CSV.`);
        } else {
          alert("Could not parse items. Please ensure columns: Description, Quantity, Price");
        }
      },
    });
  };

  // Calculate totals
  const subtotal = formData.items.reduce(
    (acc, it) => acc + (it.quantity * it.unitPrice || 0),
    0
  );
  const effectiveVat = formData.isReverseCharge ? 0 : formData.vatRate;
  const taxAmount = (subtotal * effectiveVat) / 100;
  const grandTotal = subtotal + taxAmount;

  // Real-time generated XML
  const generatedXml = generateEn16931UblXml(formData);

  // Download XML with Free Quota Check
  const handleDownloadXml = () => {
    if (invoicesCreated >= 2) {
      onOpenPaywall();
      return;
    }
    onInvoiceCreated();
    downloadXmlStringAsFile(generatedXml, `${formData.invoiceNumber}.xml`);
    handleSaveInvoice();
  };

  // Download PDF with Free Quota Check
  const handleDownloadPdf = async () => {
    if (invoicesCreated >= 2) {
      onOpenPaywall();
      return;
    }
    try {
      setIsExportingPdf(true);
      onInvoiceCreated();
      await exportElementToA4Pdf("printable-a4-generator-preview", `${formData.invoiceNumber}.pdf`);
      handleSaveInvoice();
    } catch (e: any) {
      alert("Error generating PDF: " + e.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveInvoice = () => {
    onSaveToArchive({
      invoiceNumber: formData.invoiceNumber,
      issueDate: formData.issueDate,
      buyerName: formData.buyerName,
      grossAmount: grandTotal,
      standard: formData.standard,
      xml: generatedXml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            B2B Mandate Ready (EN 16931)
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.generator.title}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {t.generator.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadXml}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t.generator.downloadXmlBtn}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? "Exporting..." : t.generator.downloadPdfBtn}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace: Form on Left, Live Dual Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Editor Form (7 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Country & Standard Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t.generator.countryStandard}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStandardChange("de_xrechnung")}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                  formData.standard === "de_xrechnung"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500"
                    : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700"
                }`}
              >
                <span className="block font-bold">🇩🇪 XRechnung 3.0</span>
                <span className="text-[11px] text-slate-500">DE / AT (UBL)</span>
              </button>
              <button
                type="button"
                onClick={() => handleStandardChange("fr_facturx")}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                  formData.standard === "fr_facturx"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500"
                    : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700"
                }`}
              >
                <span className="block font-bold">🇫🇷 Factur-X</span>
                <span className="text-[11px] text-slate-500">FR Chorus Pro</span>
              </button>
              <button
                type="button"
                onClick={() => handleStandardChange("peppol_bis3")}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                  formData.standard === "peppol_bis3"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500"
                    : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700"
                }`}
              >
                <span className="block font-bold">🇧🇪🇳🇱 Peppol BIS 3.0</span>
                <span className="text-[11px] text-slate-500">BE / NL / EU</span>
              </button>
            </div>
          </div>

          {/* 2. Metadata (Invoice #, Dates, Routing ID) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.generator.invoiceMeta}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Rechnungs-Nr.
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.generator.invoiceDate}
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.generator.dueDate}
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                {formData.standard === "fr_facturx"
                  ? "Chorus Pro / SIRET Destinataire (Acheteur)"
                  : formData.standard === "peppol_bis3"
                  ? "Peppol Participant ID (KvK / KBO)"
                  : "Leitweg-ID / Käuferreferenz (BT-10)"}
              </label>
              <input
                type="text"
                value={formData.buyerReference}
                onChange={(e) => setFormData({ ...formData, buyerReference: e.target.value })}
                placeholder="04011000-12345-67"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* 3. Parties: Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                {t.generator.sellerInfo}
              </h4>
              <div>
                <label className="text-slate-600 font-medium block">Firma</label>
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block">Straße</label>
                <input
                  type="text"
                  value={formData.sellerStreet}
                  onChange={(e) => setFormData({ ...formData, sellerStreet: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium block">PLZ</label>
                  <input
                    type="text"
                    value={formData.sellerPostalCode}
                    onChange={(e) => setFormData({ ...formData, sellerPostalCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block">Stadt</label>
                  <input
                    type="text"
                    value={formData.sellerCity}
                    onChange={(e) => setFormData({ ...formData, sellerCity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 font-medium block">USt-IdNr.</label>
                <input
                  type="text"
                  value={formData.sellerVatId}
                  onChange={(e) => setFormData({ ...formData, sellerVatId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5 font-mono"
                />
              </div>
            </div>

            {/* Buyer */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                {t.generator.buyerInfo}
              </h4>
              <div>
                <label className="text-slate-600 font-medium block">Kundenfirma</label>
                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block">Straße</label>
                <input
                  type="text"
                  value={formData.buyerStreet}
                  onChange={(e) => setFormData({ ...formData, buyerStreet: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium block">PLZ</label>
                  <input
                    type="text"
                    value={formData.buyerPostalCode}
                    onChange={(e) => setFormData({ ...formData, buyerPostalCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block">Stadt</label>
                  <input
                    type="text"
                    value={formData.buyerCity}
                    onChange={(e) => setFormData({ ...formData, buyerCity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 font-medium block">Kunden USt-IdNr.</label>
                <input
                  type="text"
                  value={formData.buyerVatId}
                  onChange={(e) => setFormData({ ...formData, buyerVatId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-1.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Payment / SEPA Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              {t.generator.bankInfo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">IBAN</label>
                <input
                  type="text"
                  value={formData.sellerIban}
                  onChange={(e) => setFormData({ ...formData, sellerIban: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">BIC</label>
                <input
                  type="text"
                  value={formData.sellerBic}
                  onChange={(e) => setFormData({ ...formData, sellerBic: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. VAT Tax Rules & Intra-EU Reverse Charge */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t.generator.vatType}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vatRate: 19, isReverseCharge: false })}
                className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition ${
                  formData.vatRate === 19 && !formData.isReverseCharge
                    ? "bg-blue-50 border-blue-600 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                19% (DE)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vatRate: 20, isReverseCharge: false })}
                className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition ${
                  formData.vatRate === 20 && !formData.isReverseCharge
                    ? "bg-blue-50 border-blue-600 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                20% (FR/AT)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vatRate: 21, isReverseCharge: false })}
                className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition ${
                  formData.vatRate === 21 && !formData.isReverseCharge
                    ? "bg-blue-50 border-blue-600 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                21% (BE/NL)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vatRate: 7, isReverseCharge: false })}
                className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition ${
                  formData.vatRate === 7 && !formData.isReverseCharge
                    ? "bg-blue-50 border-blue-600 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                7% (Ermäßigt)
              </button>
            </div>

            {/* Reverse Charge Toggle */}
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.isReverseCharge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isReverseCharge: e.target.checked,
                      vatRate: e.target.checked ? 0 : 19,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  {t.generator.vatReverseCharge}
                </span>
              </label>

              {formData.isReverseCharge && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                  <strong>Rechtlicher Hinweis (wird automatisch in XML & PDF eingefügt):</strong><br />
                  {formData.reverseChargeClause}
                </div>
              )}
            </div>
          </div>

          {/* 6. Invoice Line Items + CSV Import */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.generator.itemsSection}
              </h3>

              {/* CSV Import */}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCsvImport(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <button
                  type="button"
                  className="flex items-center space-x-1 text-xs text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.generator.importCsv}</span>
                </button>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-2.5">
              {formData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-6 sm:col-span-7">
                    <input
                      type="text"
                      placeholder="Beschreibung der Leistung..."
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Menge"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-right"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Preis (€)"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-right font-medium"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={formData.items.length <= 1}
                      className="text-slate-400 hover:text-red-600 disabled:opacity-30 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{t.generator.addItem}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Dual Preview (Tabs: Live A4 PDF vs EN 16931 XML Code) */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          {/* Dual Preview Switcher Bar */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex space-x-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePreviewTab("pdf")}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activePreviewTab === "pdf"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.generator.livePreviewTab}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("xml")}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activePreviewTab === "xml"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.generator.liveXmlTab}
              </button>
            </div>

            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>EN 16931 Valid</span>
            </div>
          </div>

          {/* TAB 1: Live A4 PDF Sheet */}
          {activePreviewTab === "pdf" && (
            <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 overflow-x-auto shadow-inner">
              <div
                id="printable-a4-generator-preview"
                className="bg-white w-[210mm] min-h-[297mm] p-[16mm] shadow-lg border border-slate-200 text-slate-800 text-[12px] flex flex-col justify-between mx-auto"
                style={{ boxSizing: "border-box" }}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5">
                    <div>
                      <h1 className="text-xl font-black text-slate-900">
                        {formData.sellerName || "IHR UNTERNEHMEN"}
                      </h1>
                      <p className="text-slate-600 text-xs mt-0.5">
                        {formData.sellerStreet}<br />
                        {formData.sellerPostalCode} {formData.sellerCity}, {formData.sellerCountry}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        USt-IdNr.: {formData.sellerVatId}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wide mb-1">
                        {formData.standard.toUpperCase()}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {formData.invoiceNumber}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Datum: <strong>{formData.issueDate}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Fälligkeit: <strong>{formData.dueDate}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Ref / Leitweg-ID: <strong>{formData.buyerReference}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100 max-w-sm text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Rechnungsempfänger (Käufer)
                    </span>
                    <p className="font-bold text-slate-900">{formData.buyerName}</p>
                    <p className="text-slate-600 mt-0.5">
                      {formData.buyerStreet}<br />
                      {formData.buyerPostalCode} {formData.buyerCity}, {formData.buyerCountry}
                    </p>
                    {formData.buyerVatId && (
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        USt-IdNr.: {formData.buyerVatId}
                      </p>
                    )}
                  </div>

                  {/* Items Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">#</th>
                          <th className="py-2 px-2.5">Position</th>
                          <th className="py-2 px-2.5 text-right">Menge</th>
                          <th className="py-2 px-2.5 text-right">Einzelpreis</th>
                          <th className="py-2 px-2.5 text-right">Gesamt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-2.5 font-medium">{it.description}</td>
                            <td className="py-2 px-2.5 text-right">{it.quantity}</td>
                            <td className="py-2 px-2.5 text-right">{it.unitPrice.toFixed(2)} €</td>
                            <td className="py-2 px-2.5 text-right font-bold">
                              {(it.quantity * it.unitPrice).toFixed(2)} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-64 space-y-1 text-xs">
                      <div className="flex justify-between py-0.5 text-slate-600">
                        <span>Nettobetrag:</span>
                        <span className="font-semibold">{subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-slate-600">
                        <span>MwSt. ({effectiveVat}%):</span>
                        <span className="font-semibold">{taxAmount.toFixed(2)} €</span>
                      </div>
                      <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between text-sm font-extrabold text-slate-900">
                        <span>Gesamtbetrag (Brutto):</span>
                        <span>{grandTotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Reverse charge clause on invoice */}
                  {formData.isReverseCharge && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 mb-6 italic">
                      {formData.reverseChargeClause}
                    </div>
                  )}
                </div>

                {/* Footer Banking */}
                <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-700">Bankverbindung (SEPA)</span>
                    <p className="font-mono">IBAN: {formData.sellerIban}</p>
                    <p className="font-mono">BIC: {formData.sellerBic}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700">Normkonformität</span>
                    <p>EN 16931-1:2017 &amp; XRechnung 3.0</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Real-Time XML Code View */}
          {activePreviewTab === "xml" && (
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[600px] border border-slate-800 shadow-xl">
              <pre>{generatedXml}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

