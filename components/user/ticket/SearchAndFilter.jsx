import { TICKET_MESSAGES } from "@/constants/ticketConstants";
import { useEffect, useRef } from "react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  const searchInputRef = useRef(null);

  return (
    <input
      ref={searchInputRef}
      type="text"
      placeholder={TICKET_MESSAGES.UI.SEARCH_PLACEHOLDER}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white"
    />
  );
}
