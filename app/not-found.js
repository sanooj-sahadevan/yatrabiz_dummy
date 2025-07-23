"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-200 to-purple-300">
      <div className="bg-white rounded-xl shadow-xl px-8 py-12 w-full max-w-xl text-center">
        <h1 className="mb-2 bg-gradient-to-r from-[#b993d6] to-[#89f7fe] bg-clip-text text-[100px] font-extrabold text-transparent">
          404
        </h1>
        {/* Main Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-wide">
          OPPS! PAGE NOT FOUND
        </h2>
        {/* Subtext */}
        <p className="text-gray-600 mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist. If you
          think something is broken, report a problem.
        </p>
        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/" passHref>
            <button className="bg-blue-400 hover:bg-blue-500 text-black font-semibold px-6 py-2 rounded-full transition shadow-sm">
              RETURN HOME
            </button>
          </Link>
          <Link href="/contact" passHref>
            <button className="border-2 border-blue-400 text-blue-400 hover:bg-blue-50 font-semibold px-6 py-2 rounded-full transition shadow-sm">
              REPORT PROBLEM
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
