import type { Invoice, Dealer, Vendor } from "@/mock-data/types";
import { formatCurrency } from "./metrics";

export interface InvoiceWithComputed {
  invoice: Invoice;
  dealerName: string;
  dealerRegion: string | null;
  vendorName: string;
  totalAmount: number;
  lineCount: number;
}

/**
 * Build enriched invoice list with computed values and joined data
 */
export function buildInvoiceList(
  invoices: Invoice[],
  dealers: Dealer[],
  vendors: Vendor[]
): InvoiceWithComputed[] {
  // Create lookup maps for efficient joins
  const dealerMap = new Map(dealers.map((d) => [d.id, d]));
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Build invoice list with computed values
  const invoiceList: InvoiceWithComputed[] = invoices.map((invoice) => {
    const dealer = dealerMap.get(invoice.dealerId);
    const vendor = vendorMap.get(invoice.vendorId);

    // Calculate total amount
    const totalAmount = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    return {
      invoice,
      dealerName: dealer?.name || "Unknown Dealer",
      dealerRegion: dealer?.region || null,
      vendorName: vendor?.name || "Unknown Vendor",
      totalAmount,
      lineCount: invoice.lineItems.length,
    };
  });

  // Sort by date descending, then by invoice number
  return invoiceList.sort((a, b) => {
    const dateCompare = b.invoice.date.localeCompare(a.invoice.date);
    if (dateCompare !== 0) return dateCompare;
    return a.invoice.invoiceNumber.localeCompare(b.invoice.invoiceNumber);
  });
}

/**
 * Calculate aggregate summary metrics for invoices
 */
export function getInvoiceSummary(
  invoicesWithComputed: InvoiceWithComputed[]
): {
  totalInvoices: number;
  totalSpend: number;
  averageInvoiceValue: number;
  distinctDealers: number;
  distinctVendors: number;
} {
  const totalSpend = invoicesWithComputed.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );

  const distinctDealers = new Set(
    invoicesWithComputed.map((inv) => inv.invoice.dealerId)
  ).size;

  const distinctVendors = new Set(
    invoicesWithComputed.map((inv) => inv.invoice.vendorId)
  ).size;

  return {
    totalInvoices: invoicesWithComputed.length,
    totalSpend,
    averageInvoiceValue:
      invoicesWithComputed.length > 0
        ? totalSpend / invoicesWithComputed.length
        : 0,
    distinctDealers,
    distinctVendors,
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Re-export formatCurrency for convenience
export { formatCurrency };

