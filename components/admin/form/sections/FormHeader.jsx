import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import {
  TICKET_FORM_BUTTONS,
  TICKET_FORM_OTHER,
} from "@/constants/ticketFormConstants";

export const FormHeader = ({ onBack, isEditMode, readOnly }) => (
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
    >
      <FaArrowLeft className="text-sm" />
      {TICKET_FORM_BUTTONS.BACK_TO_TICKETS}
    </button>
    <h1 className="text-xl font-bold text-black text-center">
      {isEditMode && readOnly
        ? "View Ticket"
        : isEditMode
        ? TICKET_FORM_OTHER.EDIT_TICKET_TITLE
        : TICKET_FORM_OTHER.ADD_NEW_TICKET}
    </h1>
    <div />
  </div>
);
