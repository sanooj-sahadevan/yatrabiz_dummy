"use client";
import { useState } from "react";
import AdminLoginModal from "@/components/auth/adminLoginModal";

export default function AdminLoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Portal</h1>
        <p className="text-gray-600">Please sign in to access the admin dashboard</p>
      </div>
      <AdminLoginModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

