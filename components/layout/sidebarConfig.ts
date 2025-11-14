import {
  LayoutDashboard,
  Building2,
  Factory,
  FileText,
  Percent,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Dealers",
    href: "/dealers",
    icon: Building2,
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: Factory,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "Rebates",
    href: "/rebates",
    icon: Percent,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

