import React from "react";
import DatePicker from "react-datepicker";
import { Controller } from "react-hook-form";
import { formatLocalDateTime } from "@/utils/formatters";
import { FormSection, FormRow, FormField } from "../FormLayout";
import {
  TICKET_FORM_LABELS,
  TICKET_FORM_VALIDATION,
  TICKET_FORM_SECTIONS,
} from "@/constants/ticketFormConstants";

export const ImportantDatesSection = ({
  control,
  errors,
  register,
  formData,
  readOnly = false,
}) => (
  <FormSection title={TICKET_FORM_SECTIONS.IMPORTANT_DATES}>
    <FormRow>
      <FormField label={TICKET_FORM_LABELS.PURCHASE_DATE}>
        <input
          id="purchaseDate"
          type="date"
          {...register("purchaseDate", {
            required: TICKET_FORM_VALIDATION.PURCHASE_DATE_REQUIRED,
          })}
          className={`form-input ${
            errors.purchaseDate ? "border-red-500" : ""
          }`}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.purchaseDate && (
            <p className="text-red-500 text-xs">
              {errors.purchaseDate.message}
            </p>
          )}
        </div>
      </FormField>
      <FormField label={TICKET_FORM_LABELS.NAME_SUBMISSION_DATE}>
        <Controller
          name="dateOfNameSubmission"
          control={control}
          rules={{
            required: TICKET_FORM_VALIDATION.DATE_REQUIRED,
            validate: {
              between: (value) => {
                if (!value || !formData.dateOfJourney || !formData.purchaseDate)
                  return true;
                const submissionDate = new Date(value.replace(" ", "T"));
                const journeyDate = new Date(formData.dateOfJourney);
                const purchaseDate = new Date(formData.purchaseDate);
                return (
                  (submissionDate >= purchaseDate &&
                    submissionDate <= journeyDate) ||
                  TICKET_FORM_VALIDATION.DATE_BETWEEN
                );
              },
            },
          }}
          render={({ field }) => (
            <DatePicker
              selected={
                field.value ? new Date(field.value.replace(" ", "T")) : null
              }
              onChange={(date) =>
                field.onChange(date ? formatLocalDateTime(date) : null)
              }
              minDate={
                formData.purchaseDate ? new Date(formData.purchaseDate) : null
              }
              maxDate={
                formData.dateOfJourney ? new Date(formData.dateOfJourney) : null
              }
              showTimeSelect
              timeIntervals={1}
              timeFormat="HH:mm"
              dateFormat="yyyy-MM-dd HH:mm"
              className={`form-input ${
                errors.dateOfNameSubmission ? "border-red-500" : ""
              }`}
              placeholderText="YYYY-MM-DD HH:MM"
              autoComplete="off"
              disabled={readOnly}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1 mb-1">
          Must be between purchase date and journey date.
        </div>
        <div className="h-4">
          {errors.dateOfNameSubmission && (
            <p className="text-red-500 text-xs">
              {errors.dateOfNameSubmission.message}
            </p>
          )}
        </div>
      </FormField>
      <FormField label={TICKET_FORM_LABELS.OUTSTANDING_DATE}>
        <Controller
          name="outstandingDate"
          control={control}
          rules={{
            required: TICKET_FORM_VALIDATION.DATE_REQUIRED,
            validate: {
              between: (value) => {
                if (!value || !formData.dateOfJourney || !formData.purchaseDate)
                  return true;
                const outstandingD = new Date(value.replace(" ", "T"));
                const journeyDate = new Date(formData.dateOfJourney);
                const purchaseDate = new Date(formData.purchaseDate);
                return (
                  (outstandingD >= purchaseDate &&
                    outstandingD <= journeyDate) ||
                  TICKET_FORM_VALIDATION.DATE_BETWEEN
                );
              },
            },
          }}
          render={({ field }) => (
            <DatePicker
              selected={
                field.value ? new Date(field.value.replace(" ", "T")) : null
              }
              onChange={(date) =>
                field.onChange(date ? formatLocalDateTime(date) : null)
              }
              minDate={
                formData.purchaseDate ? new Date(formData.purchaseDate) : null
              }
              maxDate={
                formData.dateOfJourney ? new Date(formData.dateOfJourney) : null
              }
              showTimeSelect
              timeIntervals={1}
              timeFormat="HH:mm"
              dateFormat="yyyy-MM-dd HH:mm"
              className={`form-input ${
                errors.outstandingDate ? "border-red-500" : ""
              }`}
              placeholderText="YYYY-MM-DD HH:MM"
              autoComplete="off"
              disabled={readOnly}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1 mb-1">
          Must be between purchase date and journey date.
        </div>
        <div className="h-4">
          {errors.outstandingDate && (
            <p className="text-red-500 text-xs">
              {errors.outstandingDate.message}
            </p>
          )}
        </div>
      </FormField>
    </FormRow>
  </FormSection>
);
