"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAdminSession } from "@/hooks/useAdminSession";

// Dynamically import components with no SSR to prevent hydration issues
const Sidebar = dynamic(() => import("@/components/admin/sidebar/sidebar"), {
  ssr: false,
  loading: () => (
    <aside className="bg-gray-900 border-r text-white transition-all duration-300 ease-in-out w-64 h-full flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Yatrabiz</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </aside>
  ),
});

const Topbar = dynamic(() => import("@/components/admin/topbar/topbar"), {
  ssr: false,
  loading: () => (
    <header className="bg-gray-900 border-r text-white border-b border-gray-200 flex items-center justify-between px-6 py-6 shadow-sm relative">
      <div className="flex items-center gap-8">
        <div className="w-8 h-8 animate-pulse bg-gray-700 rounded"></div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full"></div>
    </header>
  ),
});

export const TopbarTitleContext = createContext({ customTitle: null, setCustomTitle: () => {} });

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { admin: currentAdmin, loading, error } = useAdminSession();
  const [customTitle, setCustomTitle] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show error state if there's an error or no admin data
  // if (error || (!loading && !currentAdmin)) {
  //   return (
  //     <div className="h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="text-white text-center">
  //         <h2 className="text-xl font-bold mb-2">Access Denied</h2>
  //         <p className="text-gray-300">You don't have permission to access this area.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show loading state while fetching admin data
  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="flex h-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          adminRole={currentAdmin}
        />
        <div className="flex-1 flex flex-col h-full">
          <Topbar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            type="admin"
            customTitle={customTitle}
          />
          <TopbarTitleContext.Provider value={{ customTitle, setCustomTitle }}>
            <div className="flex-1 bg-gray-700 text-white overflow-auto">
              {children}
            </div>
          </TopbarTitleContext.Provider>
        </div>
      </div>
    </div>
  );
}
