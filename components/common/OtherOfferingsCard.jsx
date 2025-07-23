import React from "react";
import { OTHER_OFFERINGS_CARD } from "@/constants/homePageContent";
import { ArrowRightIcon } from "@/constants/icons";

export default function OtherOfferingsCard({
  label = OTHER_OFFERINGS_CARD.label,
  title = OTHER_OFFERINGS_CARD.title,
  buttonText = OTHER_OFFERINGS_CARD.buttonText,
  buttonLink = OTHER_OFFERINGS_CARD.buttonLink,
  onButtonClick,
}) {
  return (
    <section
      className="w-full rounded-2xl bg-gradient-to-b from-[#e3f5ff] to-[#b3e4ff] px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md min-h-[150px]"
    >
      <div>
        <div className="text-lg font-medium text-background mb-2">{label}</div>
        <div className="text-3xl md:text-4xl font-semibold text-background leading-tight">
          {title}
        </div>
      </div>
      <a
        href={buttonLink}
        onClick={onButtonClick}
        className="flex items-center bg-[#e3f5ff] rounded-full px-6 py-3 mt-6 md:mt-0 md:ml-8 shadow-sm hover:bg-[#d0eaff] transition-colors min-w-[220px]"
      >
        <span className="text-xl font-medium text-blue-900 mr-4">
          {buttonText}
        </span>
        <span className="flex items-center justify-center w-12 h-12 rounded-full text-white bg-blue-900">
          <ArrowRightIcon />
        </span>
      </a>
    </section>
  );
}
