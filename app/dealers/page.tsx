import type { Metadata } from "next";
import Link from "next/link";
import dealers from "@/mock-data/dealers.json";
import invoices from "@/mock-data/invoices.json";
import rebateEarnings from "@/mock-data/rebate-earnings.json";
import {
  buildDealerMetrics,
  calculateDealerSummary,
  formatCurrency,
  formatPercent,
} from "@/lib/dealerMetrics";

export const metadata: Metadata = {
  title: "Dealers Overview | Strata GPO",
  description: "Dealer performance, spend, and rebate metrics",
};

export default function DealersPage() {
  // Calculate metrics for all dealers
  const dealerMetrics = buildDealerMetrics(dealers, invoices, rebateEarnings);
  const summary = calculateDealerSummary(dealerMetrics);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">
            Dealers Overview
          </h1>
          <p className="text-sm text-slate-600">
            High-level spend and rebate performance by dealer, based on Q1 2025
            data.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Total Dealers
            </div>
            <div className="text-2xl font-bold text-brand">
              {summary.totalDealers}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Combined Spend
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(summary.combinedSpend)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Combined Rebate
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(summary.combinedRebate)}
            </div>
          </div>
        </div>

        {/* Dealers Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Dealer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Region
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Total Spend
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Total Rebate
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Effective Rebate %
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Vendors Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {dealerMetrics.map((dealerData, index) => (
                  <tr
                    key={dealerData.dealer.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index === dealerMetrics.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <Link
                        href={`/dealers/${dealerData.dealer.id}`}
                        className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                      >
                        {dealerData.dealer.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {dealerData.dealer.region}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(dealerData.totalSpend)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-brand">
                      {formatCurrency(dealerData.totalRebate)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-900">
                      {dealerData.effectiveRebatePercent > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {formatPercent(dealerData.effectiveRebatePercent)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                        {dealerData.vendorCount}
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
          Dealers are sorted by total spend (highest to lowest). Click a dealer
          name to view detailed analytics.
        </div>
      </div>
    </div>
  );
}

