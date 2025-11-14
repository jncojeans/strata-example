import type { Vendor, Invoice, RebateEarning } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "./metrics";

export interface VendorWithMetrics {
  vendor: Vendor;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
  dealerCount: number;
}

/**
 * Build comprehensive metrics for each vendor
 */
export function buildVendorMetrics(
  vendors: Vendor[],
  invoices: Invoice[],
  rebateEarnings: RebateEarning[]
): VendorWithMetrics[] {
  // Create maps for efficient lookups
  const vendorSpendMap = new Map<string, number>();
  const vendorDealersMap = new Map<string, Set<string>>();
  const vendorRebateMap = new Map<string, number>();

  // Calculate spend and dealer counts from invoices
  invoices.forEach((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Update spend
    const currentSpend = vendorSpendMap.get(invoice.vendorId) || 0;
    vendorSpendMap.set(invoice.vendorId, currentSpend + invoiceTotal);

    // Track unique dealers
    if (!vendorDealersMap.has(invoice.vendorId)) {
      vendorDealersMap.set(invoice.vendorId, new Set());
    }
    vendorDealersMap.get(invoice.vendorId)?.add(invoice.dealerId);
  });

  // Calculate rebates from rebate earnings
  rebateEarnings.forEach((earning) => {
    const currentRebate = vendorRebateMap.get(earning.vendorId) || 0;
    vendorRebateMap.set(earning.vendorId, currentRebate + earning.rebateAmount);
  });

  // Build metrics for each vendor
  const vendorMetrics: VendorWithMetrics[] = vendors.map((vendor) => {
    const totalSpend = vendorSpendMap.get(vendor.id) || 0;
    const totalRebate = vendorRebateMap.get(vendor.id) || 0;
    const dealerCount = vendorDealersMap.get(vendor.id)?.size || 0;
    const effectiveRebatePercent =
      totalSpend > 0 ? (totalRebate / totalSpend) * 100 : 0;

    return {
      vendor,
      totalSpend,
      totalRebate,
      effectiveRebatePercent,
      dealerCount,
    };
  });

  // Sort by total spend descending
  return vendorMetrics.sort((a, b) => b.totalSpend - a.totalSpend);
}

/**
 * Calculate aggregate summary across all vendors
 */
export function calculateVendorSummary(
  vendorMetrics: VendorWithMetrics[]
): {
  totalVendors: number;
  combinedSpend: number;
  combinedRebate: number;
} {
  return {
    totalVendors: vendorMetrics.length,
    combinedSpend: vendorMetrics.reduce(
      (sum, vendor) => sum + vendor.totalSpend,
      0
    ),
    combinedRebate: vendorMetrics.reduce(
      (sum, vendor) => sum + vendor.totalRebate,
      0
    ),
  };
}

// Re-export formatters for convenience
export { formatCurrency, formatPercent };

