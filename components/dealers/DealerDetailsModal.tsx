"use client";

import { useEffect } from "react";
import type { Dealer, Invoice, RebateEarning, Vendor, Product } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "@/lib/metrics";

interface DealerDetailsModalProps {
  dealer: Dealer;
  invoices: Invoice[];
  rebateEarnings: RebateEarning[];
  vendors: Vendor[];
  products: Product[];
  onClose: () => void;
}

export default function DealerDetailsModal({
  dealer,
  invoices,
  rebateEarnings,
  vendors,
  products,
  onClose,
}: DealerDetailsModalProps) {
  // Filter data for this dealer
  const dealerInvoices = invoices.filter((inv) => inv.dealerId === dealer.id);
  const dealerRebates = rebateEarnings.filter((re) => re.dealerId === dealer.id);

  // Calculate total spend from invoices
  const totalSpend = dealerInvoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((lineSum, item) => {
      return lineSum + item.quantity * item.unitPrice;
    }, 0);
    return sum + invoiceTotal;
  }, 0);

  // Calculate total rebates
  const totalRebate = dealerRebates.reduce((sum, re) => sum + re.rebateAmount, 0);
  const effectiveRebatePercent = totalSpend > 0 ? (totalRebate / totalSpend) * 100 : 0;

  // Calculate spend by vendor
  const vendorSpendMap = new Map<string, number>();
  dealerInvoices.forEach((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const currentSpend = vendorSpendMap.get(invoice.vendorId) || 0;
    vendorSpendMap.set(invoice.vendorId, currentSpend + invoiceTotal);
  });

  // Get top vendors
  const topVendors = Array.from(vendorSpendMap.entries())
    .map(([vendorId, spend]) => ({
      vendor: vendors.find((v) => v.id === vendorId),
      spend,
    }))
    .filter((v) => v.vendor)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  // Calculate spend by product category
  const categorySpendMap = new Map<string, number>();
  dealerInvoices.forEach((invoice) => {
    invoice.lineItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const itemTotal = item.quantity * item.unitPrice;
        const currentSpend = categorySpendMap.get(product.category) || 0;
        categorySpendMap.set(product.category, currentSpend + itemTotal);
      }
    });
  });

  // Get top categories
  const topCategories = Array.from(categorySpendMap.entries())
    .map(([category, spend]) => ({
      category,
      spend,
      percentage: (spend / totalSpend) * 100,
    }))
    .sort((a, b) => b.spend - a.spend);

  // Get recent invoices
  const recentInvoices = [...dealerInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate quarterly rebates
  const quarterlyRebates = dealerRebates
    .reduce((acc, re) => {
      const existing = acc.find((item) => item.period === re.period);
      if (existing) {
        existing.spend += re.spend;
        existing.rebate += re.rebateAmount;
      } else {
        acc.push({
          period: re.period,
          spend: re.spend,
          rebate: re.rebateAmount,
        });
      }
      return acc;
    }, [] as { period: string; spend: number; rebate: number }[])
    .sort((a, b) => a.period.localeCompare(b.period));

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-brand mb-1">
                {dealer.name}
              </h2>
              <p className="text-slate-600">{dealer.region}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Spend
              </div>
              <div className="text-2xl font-bold text-brand">
                {formatCurrency(totalSpend)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Rebate
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRebate)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Effective Rebate %
              </div>
              <div className="text-2xl font-bold text-brand">
                {formatPercent(effectiveRebatePercent)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Invoices
              </div>
              <div className="text-2xl font-bold text-brand">
                {dealerInvoices.length}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Vendors */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Top Vendors by Spend
              </h3>
              <div className="space-y-3">
                {topVendors.map((item, index) => (
                  <div
                    key={item.vendor?.id}
                    className="bg-white border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.vendor?.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.vendor?.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand">
                          {formatCurrency(item.spend)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatPercent((item.spend / totalSpend) * 100)} of total
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(item.spend / totalSpend) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spend by Category */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Spend by Product Category
              </h3>
              <div className="space-y-3">
                {topCategories.map((item) => (
                  <div
                    key={item.category}
                    className="bg-white border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">
                        {item.category}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand">
                          {formatCurrency(item.spend)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatPercent(item.percentage)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quarterly Rebate Performance */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Quarterly Rebate Performance
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Period
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Spend
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Rebate Earned
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Rebate %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyRebates.map((quarter, index) => (
                    <tr
                      key={quarter.period}
                      className={`border-b border-slate-100 ${
                        index === quarterlyRebates.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {quarter.period}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900">
                        {formatCurrency(quarter.spend)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(quarter.rebate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {formatPercent((quarter.rebate / quarter.spend) * 100)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Invoices */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Recent Invoice Activity
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice, index) => {
                    const vendor = vendors.find((v) => v.id === invoice.vendorId);
                    const invoiceTotal = invoice.lineItems.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice,
                      0
                    );
                    return (
                      <tr
                        key={invoice.id}
                        className={`border-b border-slate-100 ${
                          index === recentInvoices.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {vendor?.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(invoice.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-brand">
                          {formatCurrency(invoiceTotal)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {invoice.lineItems.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-4 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-brand text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

