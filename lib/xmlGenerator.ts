export interface InvoiceFormData {
  standard: "de_xrechnung" | "fr_facturx" | "peppol_bis3";
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  buyerReference: string; // Leitweg-ID / SIRET / KvK / KBO

  // Seller
  sellerName: string;
  sellerStreet: string;
  sellerCity: string;
  sellerPostalCode: string;
  sellerCountry: string;
  sellerVatId: string;
  sellerTaxNumber?: string;
  sellerEmail?: string;
  sellerIban: string;
  sellerBic: string;

  // Buyer
  buyerName: string;
  buyerStreet: string;
  buyerCity: string;
  buyerPostalCode: string;
  buyerCountry: string;
  buyerVatId: string;

  // Tax & Items
  vatRate: number; // 19, 7, 20, 21, or 0 (Reverse Charge)
  isReverseCharge: boolean;
  reverseChargeClause?: string;

  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export function generateEn16931UblXml(data: InvoiceFormData): string {
  const lineExtensionTotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const effectiveVatRate = data.isReverseCharge ? 0 : data.vatRate;
  const taxAmount = (lineExtensionTotal * (effectiveVatRate / 100));
  const payableAmount = lineExtensionTotal + taxAmount;

  // Determine Customization and Profile IDs based on standard
  let customizationId = "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";
  let profileId = "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0";

  if (data.standard === "fr_facturx") {
    customizationId = "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended";
  } else if (data.standard === "peppol_bis3") {
    customizationId = "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0";
    profileId = "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0";
  }

  const taxCategoryId = data.isReverseCharge ? "AE" : (effectiveVatRate === 0 ? "Z" : "S");
  const reverseChargeText = data.isReverseCharge
    ? (data.reverseChargeClause || "Steuerschuldnerschaft des Leistungsempfängers / Intra-Community Supply under Reverse Charge (Art. 194-199 EU VAT Directive / § 13b UStG)")
    : "";

  const linesXml = data.items
    .map((item, idx) => {
      const lineTotal = (item.quantity * item.unitPrice).toFixed(2);
      return `    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${data.currency}">${lineTotal}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>${escapeXml(item.description)}</cbc:Description>
        <cbc:Name>${escapeXml(item.description)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${taxCategoryId}</cbc:ID>
          <cbc:Percent>${effectiveVatRate.toFixed(2)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${data.currency}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
             xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
             xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${customizationId}</cbc:CustomizationID>
  <cbc:ProfileID>${profileId}</cbc:ProfileID>
  <cbc:ID>${escapeXml(data.invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${data.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  ${data.isReverseCharge ? `<cbc:Note>${escapeXml(reverseChargeText)}</cbc:Note>` : ""}
  <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>${escapeXml(data.buyerReference || "NON-SPECIFIED")}</cbc:BuyerReference>

  <!-- AccountingSupplierParty (Seller) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(data.sellerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.sellerStreet)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(data.sellerCity)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(data.sellerPostalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(data.sellerCountry)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(data.sellerVatId)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      ${data.sellerEmail ? `
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(data.sellerEmail)}</cbc:ElectronicMail>
      </cac:Contact>` : ""}
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- AccountingCustomerParty (Buyer) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(data.buyerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.buyerStreet)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(data.buyerCity)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(data.buyerPostalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(data.buyerCountry)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(data.buyerVatId || "NOT-PROVIDED")}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- PaymentMeans (SEPA Credit Transfer) -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXml(data.sellerIban.replace(/\s+/g, ""))}</cbc:ID>
      ${data.sellerBic ? `
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${escapeXml(data.sellerBic.replace(/\s+/g, ""))}</cbc:ID>
      </cac:FinancialInstitutionBranch>` : ""}
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>

  <!-- TaxTotal -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currency}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${data.currency}">${lineExtensionTotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${data.currency}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${taxCategoryId}</cbc:ID>
        <cbc:Percent>${effectiveVatRate.toFixed(2)}</cbc:Percent>
        ${data.isReverseCharge ? `<cbc:TaxExemptionReason>${escapeXml(reverseChargeText)}</cbc:TaxExemptionReason>` : ""}
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- LegalMonetaryTotal -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${data.currency}">${lineExtensionTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${data.currency}">${lineExtensionTotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currency}">${payableAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${data.currency}">${payableAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Line Items -->
${linesXml}
</ubl:Invoice>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "\'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

