import type { Metadata } from "next";
import rebateEarnings from "@/mock-data/rebate-earnings.json";
import dealers from "@/mock-data/dealers.json";
import vendors from "@/mock-data/vendors.json";
import type { RebateEarning, Dealer, Vendor } from "@/mock-data/types";
import {
  buildGlobalRebateSummary,
  buildDealerRebateRows,
  buildVendorRebateRows,
  buildPeriodRebateRows,
  formatCurrency,
  formatPercent,
} from "@/lib/rebateMetrics";

export const metadata: Metadata = {
  title: "Rebates | Strata GPO",
  description: "Rebate performance overview across dealers, vendors, and periods",
};

export default function RebatesPage() {
  // Compute all aggregates
  const summary = buildGlobalRebateSummary(
    rebateEarnings as RebateEarning[]
  );
  const dealerRows = buildDealerRebateRows(
    rebateEarnings as RebateEarning[],
    dealers as Dealer[]
  );
  const vendorRows = buildVendorRebateRows(
    rebateEarnings as RebateEarning[],
    vendors as Vendor[]
  );
  const periodRows = buildPeriodRebateRows(rebateEarnings as RebateEarning[]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Rebates</h1>
          <p className="text-sm text-slate-600">
            Overview of rebate performance across dealers, vendors, and time
            periods, based on Q1 2025 data.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Total Rebate
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(summary.totalRebate)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Total Spend
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(summary.totalSpend)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Effective Rebate %
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatPercent(summary.effectiveRebatePercent)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Number of Periods
            </div>
            <div className="text-2xl font-bold text-brand">
              {summary.periodCount}
            </div>
          </div>
        </div>

        {/* Dealer and Vendor Tables - Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rebates by Dealer */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Rebates by Dealer
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Rebate performance by dealer partner
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Dealer
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Spend
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Rebate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Rate %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dealerRows.map((row, index) => (
                    <tr
                      key={row.dealerId}
                      className={`hover:bg-slate-50 transition-colors ${
                        index !== dealerRows.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {row.dealerName}
                        </div>
                        {row.region && (
                          <div className="text-xs text-slate-500">
                            {row.region}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {formatCurrency(row.totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-brand">
                        {formatCurrency(row.totalRebate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.effectiveRebatePercent > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {formatPercent(row.effectiveRebatePercent)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rebates by Vendor */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Rebates by Vendor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Rebate generation by vendor partner
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Vendor
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Spend
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Rebate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                      Rate %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vendorRows.map((row, index) => (
                    <tr
                      key={row.vendorId}
                      className={`hover:bg-slate-50 transition-colors ${
                        index !== vendorRows.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {row.vendorName}
                        </div>
                        {row.primaryCategory && (
                          <div className="text-xs text-slate-500">
                            {row.primaryCategory}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {formatCurrency(row.totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-brand">
                        {formatCurrency(row.totalRebate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.effectiveRebatePercent > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {formatPercent(row.effectiveRebatePercent)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rebates by Period - Full Width */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Rebates by Period
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quarterly rebate performance trends
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Period
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Total Spend
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Total Rebate
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Effective Rate %
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Dealers
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Vendors
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodRows.map((row, index) => (
                  <tr
                    key={row.period}
                    className={`hover:bg-slate-50 transition-colors ${
                      index !== periodRows.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {row.period}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-700">
                      {formatCurrency(row.totalSpend)}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-brand">
                      {formatCurrency(row.totalRebate)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800">
                        {formatPercent(row.effectiveRebatePercent)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                        {row.dealerCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                        {row.vendorCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-slate-500 text-center">
          Rebate data represents tracked earnings from GPO programs. Dealers and
          vendors are sorted by total rebate (highest first).
        </div>
      </div>
    </div>
  );
}

