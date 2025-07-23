import React from "react";
import { INFO_COLUMNS } from "@/constants/homePageContent";

export default function InfoColumns() {
  return (
    <section className="w-full bg-background-alt py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1 */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{INFO_COLUMNS[0].heading}</h2>
          <p className="text-gray-700 text-sm md:text-base">
            {INFO_COLUMNS[0].text}
          </p>
        </div>
        {/* Column 2 */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{INFO_COLUMNS[1].heading}</h2>
          <p className="text-gray-700 text-sm md:text-base">
            {INFO_COLUMNS[1].text}
          </p>
        </div>
        {/* Column 3 */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{INFO_COLUMNS[2].heading}</h2>
          <p className="text-gray-700 text-sm md:text-base">
            {INFO_COLUMNS[2].text}
          </p>
        </div>
      </div>
    </section>
  );
} 