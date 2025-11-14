import type { Metadata } from "next";
import Link from "next/link";
import vendors from "@/mock-data/vendors.json";
import invoices from "@/mock-data/invoices.json";
import rebateEarnings from "@/mock-data/rebate-earnings.json";
import {
  buildVendorMetrics,
  calculateVendorSummary,
  formatCurrency,
  formatPercent,
} from "@/lib/vendorMetrics";

export const metadata: Metadata = {
  title: "Vendors Overview | Strata GPO",
  description: "Vendor performance, spend, rebates, and dealer coverage",
};

export default function VendorsPage() {
  // Calculate metrics for all vendors
  // Vendors are sorted by total spend (highest to lowest)
  const vendorMetrics = buildVendorMetrics(vendors, invoices, rebateEarnings);
  const summary = calculateVendorSummary(vendorMetrics);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">
            Vendors Overview
          </h1>
          <p className="text-sm text-slate-600">
            Vendor performance across spend, rebates, and dealer coverage, based
            on Q1 2025 data.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Total Vendors
            </div>
            <div className="text-2xl font-bold text-brand">
              {summary.totalVendors}
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

        {/* Vendors Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Primary Category
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
                    Dealers Served
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendorMetrics.map((vendorData, index) => (
                  <tr
                    key={vendorData.vendor.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index === vendorMetrics.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <Link
                        href={`/vendors/${vendorData.vendor.id}`}
                        className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                      >
                        {vendorData.vendor.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {vendorData.vendor.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(vendorData.totalSpend)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-brand">
                      {formatCurrency(vendorData.totalRebate)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-900">
                      {vendorData.effectiveRebatePercent > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {formatPercent(vendorData.effectiveRebatePercent)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                        {vendorData.dealerCount}
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
          Vendors are sorted by total spend (highest to lowest). Click a vendor
          name to view detailed analytics.
        </div>
      </div>
    </div>
  );
}

