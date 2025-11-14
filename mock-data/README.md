# Mock Data

This folder contains mocked JSON data for GPO (Group Purchasing Organization) reporting.

## Data Files

- `dealers.json` - 5 dealers across different regions with annual spend data
- `vendors.json` - 5 vendors covering Refrigeration, Cooking Equipment, Smallwares, and Janitorial categories
- `products.json` - 13 products with SKUs, pricing, and vendor relationships
- `invoices.json` - 12 invoices with line items spanning Q1 2025
- `rebate-programs.json` - Tiered rebate programs for each vendor
- `rebate-earnings.json` - Calculated rebate earnings by dealer-vendor-period
- `types.ts` - TypeScript interfaces for all data structures

## Data Relationships

- Products belong to Vendors (via `vendorId`)
- Invoices link Dealers and Vendors (via `dealerId` and `vendorId`)
- Invoice line items reference Products (via `productId`)
- Rebate Programs are tied to Vendors (via `vendorId`)
- Rebate Earnings track actual earnings by Dealer-Vendor combination per period

All IDs use UUID format for realistic data modeling.

