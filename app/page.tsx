import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import RebateByPeriodChart from "@/components/dashboard/RebateByPeriodChart";
import dealers from "@/mock-data/dealers.json";
import vendors from "@/mock-data/vendors.json";
import invoices from "@/mock-data/invoices.json";
import rebateEarnings from "@/mock-data/rebate-earnings.json";
import type { RebateEarning } from "@/mock-data/types";
import {
  getTotalDealers,
  getTotalVendors,
  calculateTotalSpend,
  calculateTotalRebate,
  calculateAverageRebatePercent,
  getTopDealersBySpend,
  getTopVendorsByRebate,
  formatCurrency,
  formatPercent,
} from "@/lib/metrics";
import { buildRebatePeriodSeries } from "@/lib/rebateMetrics";

export default function HomePage() {
  // Calculate KPIs
  const totalDealers = getTotalDealers(dealers);
  const totalVendors = getTotalVendors(vendors);
  const totalSpend = calculateTotalSpend(invoices);
  const totalRebate = calculateTotalRebate(rebateEarnings);
  const avgRebatePercent = calculateAverageRebatePercent(rebateEarnings);

  // Get top performers
  const topDealers = getTopDealersBySpend(dealers, invoices, 5);
  const topVendors = getTopVendorsByRebate(vendors, rebateEarnings, 5);

  // Get rebate time series for chart
  const rebatePeriodSeries = buildRebatePeriodSeries(
    rebateEarnings as RebateEarning[]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand mb-2">
            Strata GPO Reporting Dashboard
          </h1>
          <p className="text-slate-600">
            High-level view of dealer, vendor, and rebate performance based on
            historical transaction data.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Dealers"
            value={totalDealers.toString()}
            caption="Active dealer partners"
          />
          <StatCard
            label="Total Vendors"
            value={totalVendors.toString()}
            caption="Vendor relationships"
          />
          <StatCard
            label="YTD GPO Spend"
            value={formatCurrency(totalSpend)}
            caption="Across all dealers"
          />
          <StatCard
            label="YTD Rebate Paid"
            value={formatCurrency(totalRebate)}
            caption="Total rebates earned"
          />
          <StatCard
            label="Average Rebate %"
            value={formatPercent(avgRebatePercent)}
            caption="Weighted by spend"
          />
        </div>

        {/* Rebates Over Time Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Rebates Over Time
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Total rebate and spend by period, based on mocked rebate earnings
            data.
          </p>
          <div className="h-72">
            <RebateByPeriodChart data={rebatePeriodSeries} />
          </div>
        </div>

        {/* Top Dealers and Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Dealers */}
          <SectionCard
            title="Top Dealers by Spend"
            description="Highest spending dealers in Q1 2025"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">
                      Dealer
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">
                      Region
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">
                      Total Spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topDealers.map((dealer, index) => (
                    <tr
                      key={dealer.dealerId}
                      className={
                        index !== topDealers.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }
                    >
                      <td className="py-3 px-2 text-slate-900">
                        {dealer.dealerName}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {dealer.region}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-slate-900">
                        {formatCurrency(dealer.totalSpend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Top Vendors */}
          <SectionCard
            title="Top Vendors by Rebate"
            description="Vendors generating highest rebates in Q1 2025"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">
                      Total Rebate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topVendors.map((vendor, index) => (
                    <tr
                      key={vendor.vendorId}
                      className={
                        index !== topVendors.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }
                    >
                      <td className="py-3 px-2 text-slate-900">
                        {vendor.vendorName}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {vendor.category}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-slate-900">
                        {formatCurrency(vendor.totalRebate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
