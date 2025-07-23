import React from "react";
import { Controller } from "react-hook-form";
import SearchableDropdown from "../SearchableDropdown";
import { FormSection, FormRow, FormField } from "../FormLayout";
import {
  TICKET_FORM_LABELS,
  TICKET_FORM_PLACEHOLDERS,
  TICKET_FORM_VALIDATION,
  TICKET_FORM_SECTIONS,
} from "@/constants/ticketFormConstants";

export const JourneyDetailsSection = ({
  register,
  control,
  errors,
  formData,
  isEditMode,
  initialData,
  tickets,
  watch,
  readOnly = false,
}) => {
  const generatePNR = watch("generatePNR");

  return (
    <FormSection title={TICKET_FORM_SECTIONS.JOURNEY_DETAILS}>
      {/* Row 1: Main Ticket Details */}
      <FormRow>
        <FormField label={TICKET_FORM_LABELS.PNR}>
          <input
            id="PNR"
            type="text"
            {...register("PNR", {
              required: generatePNR
                ? false
                : TICKET_FORM_VALIDATION.PNR_REQUIRED,
              minLength: generatePNR
                ? undefined
                : {
                    value: 6,
                    message: TICKET_FORM_VALIDATION.PNR_LENGTH,
                  },
              maxLength: generatePNR
                ? undefined
                : {
                    value: 6,
                    message: TICKET_FORM_VALIDATION.PNR_LENGTH,
                  },
              pattern: generatePNR
                ? undefined
                : {
                    value: /^[a-zA-Z0-9]{6}$/,
                    message: TICKET_FORM_VALIDATION.PNR_ALPHANUMERIC,
                  },
              validate: {
                unique: (value) => {
                  if (generatePNR) return true;
                  if (isEditMode && value === initialData.PNR) return true;
                  return (
                    !tickets.some((ticket) => ticket.PNR === value) ||
                    TICKET_FORM_VALIDATION.PNR_UNIQUE
                  );
                },
              },
            })}
            className={`form-input ${errors.PNR ? "border-red-500" : ""} mb-2`}
            placeholder={TICKET_FORM_PLACEHOLDERS.PNR}
            disabled={readOnly || generatePNR}
          />
          {!isEditMode && (
            <div className="flex items-center mt-2">
              <input
                id="generatePNR"
                type="checkbox"
                {...register("generatePNR")}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={readOnly}
              />
              <label
                htmlFor="generatePNR"
                className="ml-2 block text-sm text-gray-900"
              >
                Generate PNR
              </label>
            </div>
          )}
          {isEditMode && initialData.isDummyPNR && (
            <div className="flex items-center mt-2">
              <input
                id="isOriginalPNR"
                type="checkbox"
                {...register("isOriginalPNR")}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={readOnly}
              />
              <label
                htmlFor="isOriginalPNR"
                className="ml-2 block text-sm text-gray-900"
              >
                Is this original PNR?
              </label>
            </div>
          )}
          <div className="h-4">
            {errors.PNR && <p className="text-red-500 text-xs mt-1 mb-1">{errors.PNR.message}</p>}
          </div>
        </FormField>

        <FormField label={TICKET_FORM_LABELS.AIRLINE}>
          <Controller
            name="airline"
            control={control}
            rules={{ required: TICKET_FORM_VALIDATION.AIRLINE_REQUIRED }}
            render={({ field }) => (
              <SearchableDropdown
                value={field.value}
                onChange={field.onChange}
                placeholder={TICKET_FORM_PLACEHOLDERS.AIRLINE}
                type="airline"
                error={errors.airline}
                disabled={readOnly}
              />
            )}
          />
          <div className="h-4">
            {errors.airline && (
              <p className="text-red-500 text-xs">{errors.airline.message}</p>
            )}
          </div>
        </FormField>

        <FormField label={TICKET_FORM_LABELS.FLIGHT_NUMBER}>
          <input
            id="flightNumber"
            type="text"
            {...register("flightNumber", {
              required: TICKET_FORM_VALIDATION.FLIGHT_NUMBER_REQUIRED,
              validate: {
                noWhitespace: (value) =>
                  value.trim() !== "" ||
                  TICKET_FORM_VALIDATION.FLIGHT_NUMBER_WHITESPACE,
              },
            })}
            className={`form-input ${
              errors.flightNumber ? "border-red-500" : ""
            }`}
            placeholder={TICKET_FORM_PLACEHOLDERS.FLIGHT_NUMBER}
            disabled={readOnly}
          />
          <div className="h-4">
            {errors.flightNumber && (
              <p className="text-red-500 text-xs">{errors.flightNumber.message}</p>
            )}
          </div>
        </FormField>

        <FormField label={TICKET_FORM_LABELS.TOTAL_SEATS}>
          <input
            id="totalSeats"
            type="number"
            {...register("totalSeats", {
              required: TICKET_FORM_VALIDATION.SEATS_REQUIRED,
              min: {
                value: 0,
                message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
              },
            })}
            className={`form-input ${
              errors.totalSeats ? "border-red-500" : ""
            }`}
            placeholder={TICKET_FORM_PLACEHOLDERS.SEATS}
            disabled={readOnly}
          />
          <div className="h-4">
            {errors.totalSeats && (
              <p className="text-red-500 text-xs">{errors.totalSeats.message}</p>
            )}
          </div>
        </FormField>

        <FormField label={TICKET_FORM_LABELS.AVAILABLE_SEATS}>
          <input
            id="availableSeats"
            type="number"
            {...register("availableSeats", {
              required: TICKET_FORM_VALIDATION.AVAILABLE_SEATS_REQUIRED,
              min: {
                value: 0,
                message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
              },
              validate: (value) =>
                parseInt(value, 10) <= parseInt(formData.totalSeats, 10) ||
                TICKET_FORM_VALIDATION.CANNOT_EXCEED_TOTAL_SEATS,
            })}
            className={`form-input ${
              errors.availableSeats ? "border-red-500" : ""
            }`}
            placeholder={TICKET_FORM_PLACEHOLDERS.SEATS}
            disabled={readOnly || !isEditMode}
          />
          <div className="h-4">
            {errors.availableSeats && (
              <p className="text-red-500 text-xs">{errors.availableSeats.message}</p>
            )}
          </div>
        </FormField>
      </FormRow>

      {/* Row 2: Only Journey Type now */}
      <FormRow>
        <FormField label={TICKET_FORM_LABELS.JOURNEY_TYPE}>
          <select
            id="journeyType"
            {...register("journeyType", {
              required: TICKET_FORM_VALIDATION.JOURNEY_TYPE_REQUIRED,
            })}
            className={`form-input ${
              errors.journeyType ? "border-red-500" : ""
            }`}
            disabled={readOnly}
          >
            <option value="">Select Journey Type</option>
            <option value="Domestic">Domestic</option>
            <option value="International">International</option>
          </select>
          <div className="h-4">
            {errors.journeyType && (
              <p className="text-red-500 text-xs">{errors.journeyType.message}</p>
            )}
          </div>
        </FormField>
      </FormRow>
    </FormSection>
  );
};
