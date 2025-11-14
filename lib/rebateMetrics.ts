import type { RebateEarning, Dealer, Vendor } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "./metrics";

export interface GlobalRebateSummary {
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
  periodCount: number;
}

export interface DealerRebateRow {
  dealerId: string;
  dealerName: string;
  region: string | null;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
}

export interface VendorRebateRow {
  vendorId: string;
  vendorName: string;
  primaryCategory: string | null;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
}

export interface PeriodRebateRow {
  period: string;
  totalSpend: number;
  totalRebate: number;
  effectiveRebatePercent: number;
  dealerCount: number;
  vendorCount: number;
}

export interface RebatePeriodPoint {
  period: string;
  totalSpend: number;
  totalRebate: number;
}

/**
 * Build global rebate summary metrics
 */
export function buildGlobalRebateSummary(
  earnings: RebateEarning[]
): GlobalRebateSummary {
  const totalSpend = earnings.reduce((sum, e) => sum + e.spend, 0);
  const totalRebate = earnings.reduce((sum, e) => sum + e.rebateAmount, 0);
  const periodCount = new Set(earnings.map((e) => e.period)).size;

  return {
    totalSpend,
    totalRebate,
    effectiveRebatePercent: totalSpend > 0 ? (totalRebate / totalSpend) * 100 : 0,
    periodCount,
  };
}

/**
 * Build rebate aggregation by dealer
 */
export function buildDealerRebateRows(
  earnings: RebateEarning[],
  dealers: Dealer[]
): DealerRebateRow[] {
  // Create dealer lookup map
  const dealerMap = new Map(dealers.map((d) => [d.id, d]));

  // Aggregate by dealer
  const dealerAggMap = new Map<
    string,
    { spend: number; rebate: number }
  >();

  earnings.forEach((earning) => {
    const current = dealerAggMap.get(earning.dealerId) || {
      spend: 0,
      rebate: 0,
    };
    dealerAggMap.set(earning.dealerId, {
      spend: current.spend + earning.spend,
      rebate: current.rebate + earning.rebateAmount,
    });
  });

  // Build rows
  const rows: DealerRebateRow[] = Array.from(dealerAggMap.entries()).map(
    ([dealerId, data]) => {
      const dealer = dealerMap.get(dealerId);
      return {
        dealerId,
        dealerName: dealer?.name || "Unknown Dealer",
        region: dealer?.region || null,
        totalSpend: data.spend,
        totalRebate: data.rebate,
        effectiveRebatePercent:
          data.spend > 0 ? (data.rebate / data.spend) * 100 : 0,
      };
    }
  );

  // Sort by total rebate descending
  return rows.sort((a, b) => b.totalRebate - a.totalRebate);
}

/**
 * Build rebate aggregation by vendor
 */
export function buildVendorRebateRows(
  earnings: RebateEarning[],
  vendors: Vendor[]
): VendorRebateRow[] {
  // Create vendor lookup map
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Aggregate by vendor
  const vendorAggMap = new Map<
    string,
    { spend: number; rebate: number }
  >();

  earnings.forEach((earning) => {
    const current = vendorAggMap.get(earning.vendorId) || {
      spend: 0,
      rebate: 0,
    };
    vendorAggMap.set(earning.vendorId, {
      spend: current.spend + earning.spend,
      rebate: current.rebate + earning.rebateAmount,
    });
  });

  // Build rows
  const rows: VendorRebateRow[] = Array.from(vendorAggMap.entries()).map(
    ([vendorId, data]) => {
      const vendor = vendorMap.get(vendorId);
      return {
        vendorId,
        vendorName: vendor?.name || "Unknown Vendor",
        primaryCategory: vendor?.category || null,
        totalSpend: data.spend,
        totalRebate: data.rebate,
        effectiveRebatePercent:
          data.spend > 0 ? (data.rebate / data.spend) * 100 : 0,
      };
    }
  );

  // Sort by total rebate descending
  return rows.sort((a, b) => b.totalRebate - a.totalRebate);
}

/**
 * Build rebate aggregation by period
 */
export function buildPeriodRebateRows(
  earnings: RebateEarning[]
): PeriodRebateRow[] {
  // Aggregate by period
  const periodAggMap = new Map<
    string,
    {
      spend: number;
      rebate: number;
      dealers: Set<string>;
      vendors: Set<string>;
    }
  >();

  earnings.forEach((earning) => {
    if (!periodAggMap.has(earning.period)) {
      periodAggMap.set(earning.period, {
        spend: 0,
        rebate: 0,
        dealers: new Set(),
        vendors: new Set(),
      });
    }

    const current = periodAggMap.get(earning.period)!;
    current.spend += earning.spend;
    current.rebate += earning.rebateAmount;
    current.dealers.add(earning.dealerId);
    current.vendors.add(earning.vendorId);
  });

  // Build rows
  const rows: PeriodRebateRow[] = Array.from(periodAggMap.entries()).map(
    ([period, data]) => ({
      period,
      totalSpend: data.spend,
      totalRebate: data.rebate,
      effectiveRebatePercent:
        data.spend > 0 ? (data.rebate / data.spend) * 100 : 0,
      dealerCount: data.dealers.size,
      vendorCount: data.vendors.size,
    })
  );

  // Sort by period ascending (string compare works for YYYY-QX format)
  return rows.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Build time series data for rebates over time (for charting)
 */
export function buildRebatePeriodSeries(
  earnings: RebateEarning[]
): RebatePeriodPoint[] {
  // Aggregate by period
  const periodMap = new Map<string, { spend: number; rebate: number }>();

  earnings.forEach((earning) => {
    const current = periodMap.get(earning.period) || { spend: 0, rebate: 0 };
    periodMap.set(earning.period, {
      spend: current.spend + earning.spend,
      rebate: current.rebate + earning.rebateAmount,
    });
  });

  // Convert to array
  const series: RebatePeriodPoint[] = Array.from(periodMap.entries()).map(
    ([period, data]) => ({
      period,
      totalSpend: data.spend,
      totalRebate: data.rebate,
    })
  );

  // Sort by period ascending (works for YYYY-QX format)
  // TODO: Implement smarter temporal sort if needed for other date formats
  return series.sort((a, b) => a.period.localeCompare(b.period));
}

// Re-export formatters for convenience
export { formatCurrency, formatPercent };

