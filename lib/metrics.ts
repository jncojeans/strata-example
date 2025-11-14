import type {
  Dealer,
  Vendor,
  Invoice,
  RebateEarning,
} from "@/mock-data/types";

/**
 * Utility function to format currency values
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Utility function to format percentage values
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Get total count of dealers
 */
export function getTotalDealers(dealers: Dealer[]): number {
  return dealers.length;
}

/**
 * Get total count of vendors
 */
export function getTotalVendors(vendors: Vendor[]): number {
  return vendors.length;
}

/**
 * Calculate total spend from all invoices
 */
export function calculateTotalSpend(invoices: Invoice[]): number {
  return invoices.reduce((total, invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    return total + invoiceTotal;
  }, 0);
}

/**
 * Calculate total rebate paid
 */
export function calculateTotalRebate(rebateEarnings: RebateEarning[]): number {
  return rebateEarnings.reduce(
    (total, earning) => total + earning.rebateAmount,
    0
  );
}

/**
 * Calculate weighted average rebate percentage
 * Weighted by spend amount
 */
export function calculateAverageRebatePercent(
  rebateEarnings: RebateEarning[]
): number {
  const totalSpend = rebateEarnings.reduce(
    (sum, earning) => sum + earning.spend,
    0
  );

  if (totalSpend === 0) return 0;

  const weightedSum = rebateEarnings.reduce((sum, earning) => {
    return sum + earning.rebatePercentApplied * earning.spend;
  }, 0);

  return weightedSum / totalSpend;
}

/**
 * Get top dealers by spend
 */
export function getTopDealersBySpend(
  dealers: Dealer[],
  invoices: Invoice[],
  limit = 5
): Array<{
  dealerId: string;
  dealerName: string;
  region: string;
  totalSpend: number;
}> {
  // Aggregate spend by dealer
  const dealerSpendMap = new Map<string, number>();

  invoices.forEach((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const currentSpend = dealerSpendMap.get(invoice.dealerId) || 0;
    dealerSpendMap.set(invoice.dealerId, currentSpend + invoiceTotal);
  });

  // Join with dealer details and sort
  const dealerSpendList = Array.from(dealerSpendMap.entries())
    .map(([dealerId, totalSpend]) => {
      const dealer = dealers.find((d) => d.id === dealerId);
      return {
        dealerId,
        dealerName: dealer?.name || "Unknown",
        region: dealer?.region || "Unknown",
        totalSpend,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);

  return dealerSpendList.slice(0, limit);
}

/**
 * Get top vendors by rebate amount
 */
export function getTopVendorsByRebate(
  vendors: Vendor[],
  rebateEarnings: RebateEarning[],
  limit = 5
): Array<{
  vendorId: string;
  vendorName: string;
  category: string;
  totalRebate: number;
}> {
  // Aggregate rebate by vendor
  const vendorRebateMap = new Map<string, number>();

  rebateEarnings.forEach((earning) => {
    const currentRebate = vendorRebateMap.get(earning.vendorId) || 0;
    vendorRebateMap.set(earning.vendorId, currentRebate + earning.rebateAmount);
  });

  // Join with vendor details and sort
  const vendorRebateList = Array.from(vendorRebateMap.entries())
    .map(([vendorId, totalRebate]) => {
      const vendor = vendors.find((v) => v.id === vendorId);
      return {
        vendorId,
        vendorName: vendor?.name || "Unknown",
        category: vendor?.category || "Unknown",
        totalRebate,
      };
    })
    .sort((a, b) => b.totalRebate - a.totalRebate);

  return vendorRebateList.slice(0, limit);
}

/**
 * Get rebate summary by period
 */
export function getRebateByPeriod(
  rebateEarnings: RebateEarning[]
): Array<{
  period: string;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
}> {
  // Group by period
  const periodMap = new Map<
    string,
    { spend: number; rebate: number }
  >();

  rebateEarnings.forEach((earning) => {
    const current = periodMap.get(earning.period) || { spend: 0, rebate: 0 };
    periodMap.set(earning.period, {
      spend: current.spend + earning.spend,
      rebate: current.rebate + earning.rebateAmount,
    });
  });

  // Convert to array and calculate effective rate
  const periodList = Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      totalSpend: data.spend,
      totalRebate: data.rebate,
      effectiveRebatePercent:
        data.spend > 0 ? (data.rebate / data.spend) * 100 : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return periodList;
}

