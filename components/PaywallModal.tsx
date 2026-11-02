"use client";

import React, { useState } from "react";
import { Language, getTranslation } from "@/locales";
import { BILLING_CONFIG } from "@/config/billing";
import { Check, X, Sparkles, Shield, CreditCard } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const t = getTranslation(currentLang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6 bg-gradient-to-b from-blue-50/70 to-transparent">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>EU E-INVOICE MANDATE 2026/2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.paywall.title}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">
            {t.paywall.subtitle}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.paywall.monthly}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{t.paywall.yearly}</span>
                <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  -35%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
          {BILLING_CONFIG.plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
            const totalPrice = billingCycle === "monthly" ? `${plan.priceMonthly}€ / Monat` : `${plan.priceYearly}€ / Jahr`;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 relative border transition flex flex-col justify-between ${
                  plan.popular
                    ? "border-blue-600 bg-blue-50/20 shadow-lg ring-1 ring-blue-600"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {t.paywall.badgeBestValue}
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                    {plan.description[currentLang] || plan.description.en}
                  </p>

                  <div className="mt-4 mb-6">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-slate-900">
                        {price}€
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {t.paywall.perMonth}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {totalPrice} (zzgl. MwSt.)
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                    {(plan.features[currentLang] || plan.features.en).map(
                      (feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="mt-8">
                  <a
                    href={plan.checkoutUrl || (plan as any).paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full block text-center py-2.5 px-4 rounded-xl text-sm font-bold shadow-md transition ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {t.paywall.selectPlan}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee & EU Payment Badges */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{t.paywall.moneyBack}</span>
          </div>

          {/* EU Payment methods */}
          <div className="flex items-center space-x-2 font-medium">
            <span>{t.paywall.paymentMethods}</span>
            <div className="flex items-center space-x-1 text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 font-bold text-[11px]">
              <span>SEPA</span>
              <span>•</span>
              <span>iDEAL</span>
              <span>•</span>
              <span>Bancontact</span>
              <span>•</span>
              <span>Visa/MC</span>
              <span>•</span>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

