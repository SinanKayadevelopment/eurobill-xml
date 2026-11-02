/**
 * EuroBill XML — Ödeme & Fiyatlandırma Konfigürasyonu
 * 
 * Burada Shopier, LemonSqueezy veya Stripe linklerinizi kolayca tanımlayabilirsiniz.
 * Tek yapmanız gereken ilgili linki aşağıdaki 'checkoutUrl' alanına yapıştırmaktır.
 */

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: {
    de: string;
    en: string;
    fr: string;
  };
  features: {
    de: string[];
    en: string[];
    fr: string[];
  };
  popular?: boolean;
  // Shopier veya LemonSqueezy / Stripe Linki:
  checkoutUrl: string;
}

export const BILLING_CONFIG = {
  freeInvoiceLimit: 2,
  currency: "EUR",
  currencySymbol: "€",

  // Ödeme Sağlayıcı Seçimi: "shopier" veya "lemonsqueezy"
  activeGateway: "shopier" as "shopier" | "lemonsqueezy" | "stripe",

  plans: [
    {
      id: "starter",
      name: "Starter Plan",
      priceMonthly: 19,
      priceYearly: 149,
      description: {
        de: "Ideal für Selbstständige und kleine Unternehmen in der EU.",
        en: "Perfect for freelancers and small businesses in the EU.",
        fr: "Parfait pour les indépendants et petites entreprises dans l'UE.",
      },
      features: {
        de: [
          "Unbegrenzte XRechnung & ZUGFeRD 2.2 XML-Generierung",
          "Factur-X & Peppol BIS Billing 3.0 Standard",
          "EN 16931 Konformitätsprüfung",
          "Unbegrenzter A4 PDF-Export",
          "1 Unternehmensprofil speichern",
          "100% DSGVO-konform (Lokale Speicherung)",
        ],
        en: [
          "Unlimited XRechnung & ZUGFeRD 2.2 XML generation",
          "Factur-X & Peppol BIS Billing 3.0 Standard",
          "EN 16931 Compliance validation",
          "Unlimited A4 PDF export",
          "Save 1 company profile",
          "100% GDPR compliant (Local processing)",
        ],
        fr: [
          "Génération illimitée de XML XRechnung & ZUGFeRD 2.2",
          "Format Factur-X & Peppol BIS Billing 3.0",
          "Validation de conformité EN 16931",
          "Exportation PDF A4 illimitée",
          "Enregistrement d'un profil d'entreprise",
          "100% conforme RGPD (Traitement local)",
        ],
      },
      popular: true,
      // Shopier linkinizi buraya yapıştırabilirsiniz:
      checkoutUrl: "https://www.shopier.com/eurobill-starter",
    },
    {
      id: "agency",
      name: "Agency / Steuerberater",
      priceMonthly: 49,
      priceYearly: 399,
      description: {
        de: "Für Steuerberater, Buchhalter und wachsende Agenturen.",
        en: "For tax advisors, accountants, and scaling multi-client agencies.",
        fr: "Pour experts-comptables et agences gérant plusieurs entités.",
      },
      features: {
        de: [
          "Alles im Starter Plan enthalten",
          "Mehrere Unternehmensprofile verwalten (Multi-Tenant)",
          "Massen-Import via CSV / Excel zu XML",
          "Stapel-PDF-Download",
          "Prioritäts-Support für EN 16931 Updates",
          "Dauerhafter Rechnungsarchiv-Export",
        ],
        en: [
          "Everything in Starter Plan",
          "Multi-tenant company profiles management",
          "Batch CSV / Excel to XML conversion",
          "Batch PDF export",
          "Priority support for EN 16931 updates",
          "Full invoice archive export",
        ],
        fr: [
          "Tout ce qui est inclus dans le plan Starter",
          "Gestion de multiples profils d'entreprises",
          "Conversion par lots CSV / Excel vers XML",
          "Exportation PDF groupée",
          "Support prioritaire pour les mises à jour EN 16931",
          "Export complet de l'archive des factures",
        ],
      },
      // Shopier linkinizi buraya yapıştırabilirsiniz:
      checkoutUrl: "https://www.shopier.com/eurobill-agency",
    },
  ] as PricingPlan[],
};
