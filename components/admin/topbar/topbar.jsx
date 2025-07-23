"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import UserDropdown from "@/components/ui/user-dropdown";
import SidebarToggle from "@/components/ui/sidebar-toggle";

const getPageName = (path) => {
  const pathParts = path.split("/");
  let pageName = pathParts[pathParts.length - 1] || "Dashboard";
  const normalized = pageName.toLowerCase();
  if (
    ["edit-tickets", "edit ticket", "add-tickets", "add ticket"].includes(
      normalized
    )
  ) {
    return "Tickets";
  }
  return pageName.charAt(0).toUpperCase() + pageName.slice(1);
};

export default function Topbar({
  isOpen,
  onToggle,
  type = "admin",
  customTitle,
}) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout: handleLogout, isInitializing } = useAuth(type);

  const handleDocumentClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <header className="bg-gray-900 border-r text-white border-b border-gray-200 flex items-center justify-between px-6 py-6 shadow-sm relative">
      <div className="flex items-center gap-8">
        {type === "admin" && (
          <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
        )}
        <h1 className="text-xl font-semibold">
          {customTitle || getPageName(pathname)}
        </h1>
      </div>
      <UserDropdown
        userEmail={user?.name || user?.email || "admin"}
        onLogout={handleLogout}
        dropdownRef={dropdownRef}
        isOpen={dropdownOpen}
        onToggle={() => setDropdownOpen((prev) => !prev)}
        type={type}
      />
    </header>
  );
}
