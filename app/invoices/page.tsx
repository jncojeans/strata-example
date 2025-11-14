import type { Metadata } from "next";
import Link from "next/link";
import invoices from "@/mock-data/invoices.json";
import dealers from "@/mock-data/dealers.json";
import vendors from "@/mock-data/vendors.json";
import {
  buildInvoiceList,
  getInvoiceSummary,
  formatCurrency,
  formatDate,
} from "@/lib/invoiceMetrics";

export const metadata: Metadata = {
  title: "Invoices | Strata GPO",
  description: "Detailed view of all invoice transactions",
};

export default function InvoicesPage() {
  // Build enriched invoice list with computed values
  const invoicesWithComputed = buildInvoiceList(invoices, dealers, vendors);
  const summary = getInvoiceSummary(invoicesWithComputed);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Invoices</h1>
          <p className="text-sm text-slate-600">
            Detailed view of all invoice transactions across dealers and
            vendors, based on Q1 2025 data.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Total Invoices
            </div>
            <div className="text-2xl font-bold text-brand">
              {summary.totalInvoices}
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
              Avg Invoice Value
            </div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(summary.averageInvoiceValue)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Dealers / Vendors
            </div>
            <div className="text-2xl font-bold text-brand">
              {summary.distinctDealers} / {summary.distinctVendors}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Dealer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Vendor
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Line Items
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoicesWithComputed.map((invoiceData, index) => (
                  <tr
                    key={invoiceData.invoice.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index === invoicesWithComputed.length - 1
                        ? "border-b-0"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-medium text-slate-900">
                        {invoiceData.invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {formatDate(invoiceData.invoice.date)}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/dealers/${invoiceData.invoice.dealerId}`}
                        className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                      >
                        {invoiceData.dealerName}
                      </Link>
                      {invoiceData.dealerRegion && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {invoiceData.dealerRegion}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/vendors/${invoiceData.invoice.vendorId}`}
                        className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                      >
                        {invoiceData.vendorName}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                        {invoiceData.lineCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(invoiceData.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-slate-500 text-center">
          Invoices are sorted by date (newest first). Click dealer or vendor
          names to view detailed analytics.
        </div>
      </div>
    </div>
  );
}

