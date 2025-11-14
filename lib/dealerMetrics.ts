import type { Dealer, Invoice, RebateEarning } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "./metrics";

export interface DealerWithMetrics {
  dealer: Dealer;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
  vendorCount: number;
}

/**
 * Build comprehensive metrics for each dealer
 */
export function buildDealerMetrics(
  dealers: Dealer[],
  invoices: Invoice[],
  rebateEarnings: RebateEarning[]
): DealerWithMetrics[] {
  // Create maps for efficient lookups
  const dealerSpendMap = new Map<string, number>();
  const dealerVendorsMap = new Map<string, Set<string>>();
  const dealerRebateMap = new Map<string, number>();

  // Calculate spend and vendor counts from invoices
  invoices.forEach((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Update spend
    const currentSpend = dealerSpendMap.get(invoice.dealerId) || 0;
    dealerSpendMap.set(invoice.dealerId, currentSpend + invoiceTotal);

    // Track unique vendors
    if (!dealerVendorsMap.has(invoice.dealerId)) {
      dealerVendorsMap.set(invoice.dealerId, new Set());
    }
    dealerVendorsMap.get(invoice.dealerId)?.add(invoice.vendorId);
  });

  // Calculate rebates from rebate earnings
  rebateEarnings.forEach((earning) => {
    const currentRebate = dealerRebateMap.get(earning.dealerId) || 0;
    dealerRebateMap.set(earning.dealerId, currentRebate + earning.rebateAmount);
  });

  // Build metrics for each dealer
  const dealerMetrics: DealerWithMetrics[] = dealers.map((dealer) => {
    const totalSpend = dealerSpendMap.get(dealer.id) || 0;
    const totalRebate = dealerRebateMap.get(dealer.id) || 0;
    const vendorCount = dealerVendorsMap.get(dealer.id)?.size || 0;
    const effectiveRebatePercent =
      totalSpend > 0 ? (totalRebate / totalSpend) * 100 : 0;

    return {
      dealer,
      totalSpend,
      totalRebate,
      effectiveRebatePercent,
      vendorCount,
    };
  });

  // Sort by total spend descending
  return dealerMetrics.sort((a, b) => b.totalSpend - a.totalSpend);
}

/**
 * Calculate aggregate summary across all dealers
 */
export function calculateDealerSummary(
  dealerMetrics: DealerWithMetrics[]
): {
  totalDealers: number;
  combinedSpend: number;
  combinedRebate: number;
} {
  return {
    totalDealers: dealerMetrics.length,
    combinedSpend: dealerMetrics.reduce(
      (sum, dealer) => sum + dealer.totalSpend,
      0
    ),
    combinedRebate: dealerMetrics.reduce(
      (sum, dealer) => sum + dealer.totalRebate,
      0
    ),
  };
}

// Re-export formatters for convenience
export { formatCurrency, formatPercent };

