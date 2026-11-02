"use client";

import React, { useState } from "react";
import { Language, getTranslation } from "@/locales";
import { downloadXmlStringAsFile } from "@/lib/pdfExport";
import {
  Building2,
  Save,
  CheckCircle,
  Archive,
  Download,
  Trash2,
  FileCode,
  Database,
  ExternalLink,
} from "lucide-react";

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  buyerName: string;
  grossAmount: number;
  standard: string;
  status: "paid" | "pending";
  xml: string;
}

interface CompanyProfileArchiveProps {
  currentLang: Language;
  profile: {
    companyName: string;
    street: string;
    postalCity: string;
    vatId: string;
    iban: string;
    bic: string;
  };
  onUpdateProfile: (profile: any) => void;
  invoices: SavedInvoice[];
  onToggleStatus: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

export const CompanyProfileArchive: React.FC<CompanyProfileArchiveProps> = ({
  currentLang,
  profile,
  onUpdateProfile,
  invoices,
  onToggleStatus,
  onDeleteInvoice,
}) => {
  const t = getTranslation(currentLang);
  const [formData, setFormData] = useState(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Company Master Profile Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Master Stammdaten (Auto-Fill)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t.archive.profileSection}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.archive.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.generator.companyName} *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.generator.vatId} (USt-IdNr.) *
              </label>
              <input
                type="text"
                required
                value={formData.vatId}
                onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.generator.address}
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.generator.postalCity}
              </label>
              <input
                type="text"
                value={formData.postalCity}
                onChange={(e) => setFormData({ ...formData, postalCity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                IBAN *
              </label>
              <input
                type="text"
                required
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                BIC (SWIFT)
              </label>
              <input
                type="text"
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{t.archive.saveProfileBtn}</span>
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {t.archive.profileSaved}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Invoices Archive Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-blue-600" />
              {t.archive.archiveSection}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gesamtzahl Rechnungen: <strong>{invoices.length}</strong>
            </p>
          </div>

          {/* Database Notice Pill */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 text-xs">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-mono">supabase_schema.sql (RLS Ready)</span>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Archive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">{t.archive.emptyArchive}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">{t.archive.tableNumber}</th>
                  <th className="py-3 px-3.5">{t.archive.tableDate}</th>
                  <th className="py-3 px-3.5">{t.archive.tableBuyer}</th>
                  <th className="py-3 px-3.5">{t.archive.tableStandard}</th>
                  <th className="py-3 px-3.5 text-right">{t.archive.tableTotal}</th>
                  <th className="py-3 px-3.5 text-center">{t.archive.tableStatus}</th>
                  <th className="py-3 px-3.5 text-right">{t.archive.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{inv.issueDate}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-800">{inv.buyerName}</td>
                    <td className="py-3 px-3.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {inv.standard}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900">
                      {inv.grossAmount.toFixed(2)} €
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => onToggleStatus(inv.id)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {inv.status === "paid" ? t.archive.statusPaid : t.archive.statusPending}
                      </button>
                    </td>
                    <td className="py-3 px-3.5 text-right space-x-2">
                      <button
                        onClick={() => downloadXmlStringAsFile(inv.xml, `${inv.invoiceNumber}.xml`)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded"
                        title={t.archive.redownloadXml}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>XML</span>
                      </button>
                      <button
                        onClick={() => onDeleteInvoice(inv.id)}
                        className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                        title={t.archive.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

