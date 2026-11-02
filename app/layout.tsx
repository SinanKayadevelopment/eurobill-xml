import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EuroBill XML — EU E-Invoice (XRechnung, ZUGFeRD, Factur-X & Peppol) Viewer & Generator",
  description: "Compliant EN 16931 European B2B E-Invoicing Platform. Zero server storage, 100% GDPR compliant. Generate & inspect XRechnung 3.0, Factur-X, and Peppol BIS 3.0 invoices.",
  keywords: [
    "XRechnung",
    "ZUGFeRD",
    "Factur-X",
    "Peppol BIS Billing 3.0",
    "EN 16931",
    "E-Rechnung Pflicht 2026",
    "XML Invoice Viewer",
    "UBL 2.1",
  ],
  authors: [{ name: "EuroBill XML" }],
  openGraph: {
    title: "EuroBill XML — EU E-Invoice Viewer & Generator",
    description: "Generate & view legally compliant European electronic invoices (EN 16931, XRechnung 3.0, Factur-X). 100% Client-Side Privacy.",
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US", "fr_FR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "EuroBill XML — EU E-Invoice Platform",
    description: "Free XML E-Invoice Viewer and compliant EN 16931 Generator.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇪🇺</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
