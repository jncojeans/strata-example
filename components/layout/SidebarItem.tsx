import Link from "next/link";
import clsx from "clsx";
import type { NavItem } from "./sidebarConfig";

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

export default function SidebarItem({
  item,
  isCollapsed,
  isActive,
}: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isCollapsed ? "justify-center" : "",
        isActive
          ? "bg-brand text-white"
          : "text-brand hover:bg-primary-50"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

