/**
 * TypeScript type definitions for Strata GPO mock data
 */

export interface Dealer {
  id: string;
  name: string;
  region: string;
  annualSpend: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  baseRebateRate: number;
}

export interface Product {
  id: string;
  vendorId: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
}

export interface InvoiceLineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  dealerId: string;
  vendorId: string;
  invoiceNumber: string;
  date: string;
  lineItems: InvoiceLineItem[];
}

export interface RebateTier {
  threshold: number;
  rebatePercent: number;
}

export interface RebateProgram {
  id: string;
  vendorId: string;
  programName: string;
  tiers: RebateTier[];
}

export interface RebateEarning {
  id: string;
  dealerId: string;
  vendorId: string;
  period: string;
  spend: number;
  rebatePercentApplied: number;
  rebateAmount: number;
}

