"use client";

import { useEffect } from "react";
import type { Vendor, Invoice, RebateEarning, Dealer, Product } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "@/lib/metrics";

interface VendorDetailsModalProps {
  vendor: Vendor;
  invoices: Invoice[];
  rebateEarnings: RebateEarning[];
  dealers: Dealer[];
  products: Product[];
  onClose: () => void;
}

export default function VendorDetailsModal({
  vendor,
  invoices,
  rebateEarnings,
  dealers,
  products,
  onClose,
}: VendorDetailsModalProps) {
  // Filter data for this vendor
  const vendorInvoices = invoices.filter((inv) => inv.vendorId === vendor.id);
  const vendorRebates = rebateEarnings.filter((re) => re.vendorId === vendor.id);
  const vendorProducts = products.filter((p) => p.vendorId === vendor.id);

  // Calculate total spend from invoices
  const totalSpend = vendorInvoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((lineSum, item) => {
      return lineSum + item.quantity * item.unitPrice;
    }, 0);
    return sum + invoiceTotal;
  }, 0);

  // Calculate total rebates
  const totalRebate = vendorRebates.reduce((sum, re) => sum + re.rebateAmount, 0);
  const effectiveRebatePercent = totalSpend > 0 ? (totalRebate / totalSpend) * 100 : 0;

  // Calculate spend by dealer (top customers)
  const dealerSpendMap = new Map<string, number>();
  vendorInvoices.forEach((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const currentSpend = dealerSpendMap.get(invoice.dealerId) || 0;
    dealerSpendMap.set(invoice.dealerId, currentSpend + invoiceTotal);
  });

  // Get top dealers (customers)
  const topDealers = Array.from(dealerSpendMap.entries())
    .map(([dealerId, spend]) => ({
      dealer: dealers.find((d) => d.id === dealerId),
      spend,
    }))
    .filter((d) => d.dealer)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  // Calculate product sales
  const productSalesMap = new Map<string, { quantity: number; revenue: number }>();
  vendorInvoices.forEach((invoice) => {
    invoice.lineItems.forEach((item) => {
      if (products.find((p) => p.id === item.productId && p.vendorId === vendor.id)) {
        const current = productSalesMap.get(item.productId) || { quantity: 0, revenue: 0 };
        productSalesMap.set(item.productId, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.quantity * item.unitPrice),
        });
      }
    });
  });

  // Get top products
  const topProducts = vendorProducts
    .map((product) => {
      const sales = productSalesMap.get(product.id) || { quantity: 0, revenue: 0 };
      return {
        product,
        ...sales,
      };
    })
    .filter((p) => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Get recent invoices
  const recentInvoices = [...vendorInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate quarterly rebates
  const quarterlyRebates = vendorRebates
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

  // Calculate unique dealers served
  const dealersServed = new Set(vendorInvoices.map((inv) => inv.dealerId)).size;

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
              <h2 className="text-3xl font-bold text-brand mb-2">
                {vendor.name}
              </h2>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {vendor.category}
                </span>
                <span className="text-sm text-slate-600">
                  Base Rebate Rate: {formatPercent(vendor.baseRebateRate)}
                </span>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
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
                Dealers Served
              </div>
              <div className="text-2xl font-bold text-brand">
                {dealersServed}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Invoices
              </div>
              <div className="text-2xl font-bold text-brand">
                {vendorInvoices.length}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Dealers (Customers) */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Top Customers by Spend
              </h3>
              <div className="space-y-3">
                {topDealers.length > 0 ? (
                  topDealers.map((item, index) => (
                    <div
                      key={item.dealer?.id}
                      className="bg-white border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-slate-900">
                              {item.dealer?.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.dealer?.region}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No customer data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Top Products by Revenue
              </h3>
              <div className="space-y-3">
                {topProducts.length > 0 ? (
                  topProducts.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="bg-white border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              SKU: {item.product.sku} • Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-brand whitespace-nowrap">
                            {formatCurrency(item.revenue)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatPercent((item.revenue / totalSpend) * 100)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(item.revenue / totalSpend) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No product sales data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Catalog */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Complete Product Catalog
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({vendorProducts.length} products)
              </span>
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {vendorProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          SKU
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Product Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          Category
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">
                          Unit Cost
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">
                          Units Sold
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorProducts.map((product, index) => {
                        const sales = productSalesMap.get(product.id) || { quantity: 0, revenue: 0 };
                        return (
                          <tr
                            key={product.id}
                            className={`border-b border-slate-100 ${
                              index === vendorProducts.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-slate-900">
                              {product.sku}
                            </td>
                            <td className="py-3 px-4 text-slate-900">
                              {product.name}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {product.category}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-brand">
                              {formatCurrency(product.unitCost)}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600">
                              {sales.quantity || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No products in catalog
                </div>
              )}
            </div>
          </div>

          {/* Quarterly Rebate Performance */}
          {quarterlyRebates.length > 0 && (
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
                        Rebate Paid
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
          )}

          {/* Recent Invoices */}
          {recentInvoices.length > 0 && (
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
                        Dealer
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
                      const dealer = dealers.find((d) => d.id === invoice.dealerId);
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
                            {dealer?.name}
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
          )}
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

