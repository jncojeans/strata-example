"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { NAV_ITEMS } from "./sidebarConfig";
import SidebarItem from "./SidebarItem";
import fullLogo from "@/lib/assets/strata full logo.png";
import smallLogo from "@/lib/assets/strata small logo.png";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebar-collapsed", String(newValue));
      return newValue;
    });
  };

  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={clsx("p-4", isCollapsed ? "flex justify-center" : "")}>
        {isCollapsed ? (
          <Image
            src={smallLogo}
            alt="Strata Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        ) : (
          <Image
            src={fullLogo}
            alt="Strata GPO"
            width={180}
            height={40}
            className="object-contain"
          />
        )}
      </div>

      {/* Collapse/Expand Button */}
      <div className={clsx("px-3 pb-3", isCollapsed ? "flex justify-center" : "")}>
        <button
          onClick={toggleCollapsed}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
            "text-slate-600 hover:bg-primary-50"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarItem
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
          );
        })}
      </nav>
    </aside>
  );
}

