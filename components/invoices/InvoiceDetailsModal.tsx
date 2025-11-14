"use client";

import { useEffect } from "react";
import type { Invoice, Dealer, Vendor, Product, RebateEarning } from "@/mock-data/types";
import { formatCurrency, formatPercent } from "@/lib/metrics";

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  dealer: Dealer | undefined;
  vendor: Vendor | undefined;
  products: Product[];
  rebateEarnings: RebateEarning[];
  onClose: () => void;
}

export default function InvoiceDetailsModal({
  invoice,
  dealer,
  vendor,
  products,
  rebateEarnings,
  onClose,
}: InvoiceDetailsModalProps) {
  // Calculate invoice totals
  const subtotal = invoice.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Get product details for line items
  const lineItemsWithProducts = invoice.lineItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
    };
  });

  // Calculate estimated rebate based on vendor's base rate
  const estimatedRebate = vendor ? (subtotal * vendor.baseRebateRate) / 100 : 0;

  // Find actual rebate earnings for this dealer/vendor combination around this time
  const relevantRebates = rebateEarnings.filter(
    (re) =>
      re.dealerId === invoice.dealerId &&
      re.vendorId === invoice.vendorId &&
      re.period.includes(new Date(invoice.date).getFullYear().toString())
  );

  const quarterlyRebateRate =
    relevantRebates.length > 0
      ? relevantRebates.reduce((sum, re) => sum + re.rebatePercentApplied, 0) /
        relevantRebates.length
      : vendor?.baseRebateRate || 0;

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
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-3xl font-bold text-brand font-mono">
                  {invoice.invoiceNumber}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Paid
                </span>
              </div>
              <div className="text-sm text-slate-600">
                Invoice Date:{" "}
                <span className="font-medium">
                  {new Date(invoice.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
        <div className="px-8 py-6 space-y-6">
          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dealer (Bill To) */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Bill To
              </div>
              {dealer ? (
                <>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    {dealer.name}
                  </div>
                  <div className="text-sm text-slate-600 mb-3">
                    {dealer.region}
                  </div>
                  <div className="pt-3 border-t border-slate-300">
                    <div className="text-xs text-slate-500 mb-1">
                      Annual Spend Capacity
                    </div>
                    <div className="text-lg font-semibold text-brand">
                      {formatCurrency(dealer.annualSpend)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500">Dealer information unavailable</div>
              )}
            </div>

            {/* Vendor (From) */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Vendor
              </div>
              {vendor ? (
                <>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    {vendor.name}
                  </div>
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vendor.category}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-300">
                    <div className="text-xs text-slate-500 mb-1">
                      Base Rebate Rate
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatPercent(vendor.baseRebateRate)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500">Vendor information unavailable</div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Line Items
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Unit Price
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        Qty
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItemsWithProducts.map((item, index) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <tr
                          key={index}
                          className={`border-b border-slate-100 ${
                            index === lineItemsWithProducts.length - 1
                              ? "border-b-0"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-4 text-slate-500 font-medium">
                            {index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900">
                              {item.product?.name || "Unknown Product"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-xs text-slate-600">
                              {item.product?.sku || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {item.product?.category || "—"}
                          </td>
                          <td className="py-4 px-4 text-right text-slate-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-slate-900">
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-300">
                <div className="text-slate-700">Subtotal</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatCurrency(subtotal)}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="text-slate-700">
                  <span>Estimated Rebate</span>
                  <span className="ml-2 text-xs text-slate-500">
                    (at {formatPercent(quarterlyRebateRate)} rate)
                  </span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  -{formatCurrency((subtotal * quarterlyRebateRate) / 100)}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 pt-4 border-t-2 border-slate-300">
                <div className="text-lg font-bold text-slate-900">
                  Net Cost (After Rebate)
                </div>
                <div className="text-2xl font-bold text-brand">
                  {formatCurrency(subtotal - (subtotal * quarterlyRebateRate) / 100)}
                </div>
              </div>
            </div>
          </div>

          {/* Rebate Information */}
          {relevantRebates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Historical Rebate Performance
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({dealer?.name} × {vendor?.name})
                </span>
              </h3>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Period
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Period Spend
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Rebate Earned
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Rebate Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantRebates
                      .sort((a, b) => a.period.localeCompare(b.period))
                      .map((rebate, index) => (
                        <tr
                          key={rebate.id}
                          className={`border-b border-slate-100 ${
                            index === relevantRebates.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {rebate.period}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900">
                            {formatCurrency(rebate.spend)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-green-600">
                            {formatCurrency(rebate.rebateAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {formatPercent(rebate.rebatePercentApplied)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Line Items
              </div>
              <div className="text-2xl font-bold text-brand">
                {invoice.lineItems.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Units
              </div>
              <div className="text-2xl font-bold text-brand">
                {invoice.lineItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Avg Item Price
              </div>
              <div className="text-2xl font-bold text-brand">
                {formatCurrency(subtotal / invoice.lineItems.length)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Invoice ID: <span className="font-mono">{invoice.id}</span>
            </div>
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

