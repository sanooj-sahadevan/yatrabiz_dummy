import React from "react";
import { FormSection, FormRow, FormField } from "../FormLayout";
import { TICKET_FORM_LABELS, TICKET_FORM_SECTIONS } from "@/constants/ticketFormConstants";

export const BaggageDetailsSection = ({ register, errors, formData, readOnly = false }) => (
  <FormSection title={TICKET_FORM_SECTIONS.BAGGAGE_DETAILS || "Baggage Details"}>
    <FormRow className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <FormField label={TICKET_FORM_LABELS.HAND_BAGGAGE || "Hand Baggage"}>
        <input
          id="handBaggage"
          type="number"
          min="0"
          {...register("handBaggage", {
            required: "Hand baggage is required",
            min: { value: 0, message: "Cannot be negative" }
          })}
          defaultValue={formData.handBaggage || 0}
          className={`form-input ${errors.handBaggage ? "border-red-500" : ""} h-8 text-sm`}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.handBaggage && (
            <span className="text-red-500 text-xs">{errors.handBaggage.message}</span>
          )}
        </div>
      </FormField>
      <FormField label={TICKET_FORM_LABELS.CHECKED_BAGGAGE || "Checked Baggage"}>
        <input
          id="checkedBaggage"
          type="number"
          min="0"
          {...register("checkedBaggage", {
            required: "Checked baggage is required",
            min: { value: 0, message: "Cannot be negative" }
          })}
          defaultValue={formData.checkedBaggage || 0}
          className={`form-input ${errors.checkedBaggage ? "border-red-500" : ""} h-8 text-sm`}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.checkedBaggage && (
            <span className="text-red-500 text-xs">{errors.checkedBaggage.message}</span>
          )}
        </div>
      </FormField>
    </FormRow>
  </FormSection>
); 