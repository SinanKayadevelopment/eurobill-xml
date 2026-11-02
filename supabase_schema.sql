-- ==============================================================================
-- EuroBill XML — Multi-Tenant Cloud Database Schema (Supabase / PostgreSQL)
-- Conformance: EU EN 16931, GDPR Article 32 (Security & Isolation), RLS Enabled
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (Organizations / Companies)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL DEFAULT 'DE', -- DE, FR, BE, NL, AT, etc.
    vat_number VARCHAR(50),                        -- e.g. DE123456789, FR12345678901
    tax_number VARCHAR(50),                        -- Steuernummer / SIRET
    peppol_id VARCHAR(100),                        -- Peppol Participant Identifier
    leitweg_id VARCHAR(50),                        -- German Leitweg-ID
    street_address TEXT,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    iban VARCHAR(34),
    bic VARCHAR(11),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tenant Members & Auth Mapping (Multi-Tenant User Isolation)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'billing_manager', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (tenant_id, user_id)
);

-- 3. Subscriptions & Paywall Limits
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'agency'
    status VARCHAR(50) NOT NULL DEFAULT 'active',   -- 'active', 'past_due', 'canceled'
    billing_provider VARCHAR(50) DEFAULT 'lemonsqueezy', -- 'lemonsqueezy', 'stripe'
    external_subscription_id VARCHAR(255),
    invoices_generated_count INTEGER DEFAULT 0,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Invoices (EN 16931 Archival & Metadata)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    standard VARCHAR(50) NOT NULL, -- 'xrechnung_3.0', 'facturx_en16931', 'peppol_bis_3.0'
    issue_date DATE NOT NULL,
    due_date DATE,
    currency VARCHAR(3) DEFAULT 'EUR',
    buyer_name VARCHAR(255) NOT NULL,
    buyer_vat_id VARCHAR(50),
    buyer_reference VARCHAR(100),
    net_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    gross_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'canceled')),
    xml_content TEXT, -- Stored EN 16931 UBL/CII XML payload
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (tenant_id, invoice_number)
);

-- 5. Row Level Security (RLS) Implementation
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check user tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE tenant_id = target_tenant_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Tenants
CREATE POLICY "Users can view and manage their authorized tenants"
ON public.tenants
FOR ALL
USING (public.is_tenant_member(id));

-- RLS Policy: Invoices (Strict Tenant Isolation)
CREATE POLICY "Tenant members can manage their invoices"
ON public.invoices
FOR ALL
USING (public.is_tenant_member(tenant_id))
WITH CHECK (public.is_tenant_member(tenant_id));

-- RLS Policy: Subscriptions
CREATE POLICY "Tenant admins can view subscription details"
ON public.subscriptions
FOR SELECT
USING (public.is_tenant_member(tenant_id));

