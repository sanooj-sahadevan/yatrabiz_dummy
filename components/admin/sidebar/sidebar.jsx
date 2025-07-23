"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/adminList";

export default function Sidebar({ isOpen, adminRole }) {
  const pathname = usePathname();

  const navItems =
    adminRole?.role === "staff" || adminRole?.role === "supplier"
      ? NAV_ITEMS.filter(
          (item) =>
            item.name !== "Ledger" &&
            item.name !== "Audit" &&
            item.name !== "Dashboard" &&
            item.name !== "Admins" &&
            item.name !== "Agents"
        )
      : NAV_ITEMS;

  return (
    <aside
      className={`bg-gray-900 border-r text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-16"
      } h-full flex flex-col`}
    >
      <div
        className={`px-6 py-6 border-b border-gray-200 flex-shrink-0 ${
          isOpen ? "whitespace-nowrap" : "px-2"
        }`}
      >
        <h1
          className={`text-xl font-bold text-white ${
            isOpen ? "" : "text-center text-sm"
          }`}
        >
          {isOpen ? "Yatrabiz" : "YB"}
        </h1>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        <div className="py-8">
          <ul className="space-y-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`py-3 rounded-lg font-medium flex items-center transition-colors
                      ${
                        isOpen
                          ? "px-4 gap-3 justify-start"
                          : "px-0 justify-center"
                      }
                      ${
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }
                    `}
                    title={!isOpen ? item.name : ""}
                  >
                    <span className="w-7 h-7 flex items-center justify-center">
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span className="transition-opacity duration-200">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="h-20"></div>
        </div>
      </nav>
    </aside>
  );
}
