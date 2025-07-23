import React from "react";
import { FormSection, FormRow, FormField } from "../FormLayout";
import { formatCurrency } from "@/utils/ticketCalculations";
import {
  TICKET_FORM_LABELS,
  TICKET_FORM_PLACEHOLDERS,
  TICKET_FORM_VALIDATION,
  TICKET_FORM_SECTIONS,
  TICKET_FORM_OTHER,
} from "@/constants/ticketFormConstants";

export const PaymentDetailsSection = ({ register, errors, formData, readOnly = false }) => (
  <FormSection title={TICKET_FORM_SECTIONS.PAYMENT_DETAILS}>
    <FormRow>
      {/* Group: Purchase, Total, Sale, Discount */}
      <FormField label={TICKET_FORM_LABELS.PURCHASE_PRICE}>
        <input
          id="purchasePrice"
          type="number"
          {...register("purchasePrice", {
            required: TICKET_FORM_VALIDATION.PURCHASE_PRICE_REQUIRED,
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          className={`form-input ${errors.purchasePrice ? "border-red-500" : ""}`}
          placeholder={TICKET_FORM_PLACEHOLDERS.PURCHASE_PRICE}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.purchasePrice && (
            <p className="text-red-500 text-xs">{errors.purchasePrice.message}</p>
          )}
        </div>
      </FormField>
      <FormField label={TICKET_FORM_LABELS.TOTAL_PRICE}>
        <input
          id="totalPrice"
          type="number"
          {...register("totalPrice", {
            required: TICKET_FORM_VALIDATION.TOTAL_PRICE_REQUIRED,
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          className={`form-input ${errors.totalPrice ? "border-red-500" : ""}`}
          placeholder={TICKET_FORM_PLACEHOLDERS.TOTAL_PRICE}
          readOnly
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.totalPrice && (
            <p className="text-red-500 text-xs">{errors.totalPrice.message}</p>
          )}
        </div>
        {formData.totalPrice > 0 && (
          <p className="text-xs text-teal-600 mt-1">
            {formatCurrency(formData.totalPrice)}
          </p>
        )}
      </FormField>
      <FormField label={TICKET_FORM_LABELS.SALE_PRICE}>
        <input
          id="salePrice"
          type="number"
          {...register("salePrice", {
            required: "Sale price is required",
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          className={`form-input ${errors.salePrice ? "border-red-500" : ""}`}
          placeholder={TICKET_FORM_PLACEHOLDERS.SALE_PRICE}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.salePrice && (
            <p className="text-red-500 text-xs">{errors.salePrice.message}</p>
          )}
        </div>
      </FormField>
      {/* Discount Field */}
      <FormField label={TICKET_FORM_LABELS.DISCOUNT || "Discount Price"}>
        <input
          id="Discount"
          type="number"
          step="0.01"
          min="0"
          {...register("Discount", {
            required: "Discount is required",
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          defaultValue={formData.Discount || 0}
          className={`form-input ${errors.Discount ? "border-red-500" : ""}`}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.Discount && (
            <span className="text-red-500 text-xs">{errors.Discount.message}</span>
          )}
        </div>
      </FormField>
    </FormRow>
    <div className="h-4" />
    <FormRow>
      {/* Group: Advance Paid, Transaction ID, Date */}
      <FormField label={TICKET_FORM_LABELS.ADVANCE_PAID}>
        <input
          id="advPaidAmount"
          type="number"
          {...register("advPaidAmount", {
            required: "Advance paid is required",
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          className={`form-input ${errors.advPaidAmount ? "border-red-500" : ""}`}
          placeholder={TICKET_FORM_PLACEHOLDERS.ADVANCE_PAID}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.advPaidAmount && (
            <p className="text-red-500 text-xs">{errors.advPaidAmount.message}</p>
          )}
        </div>
      </FormField>
      <FormField label="Advance Payment Transaction ID">
        <input
          id="advPaymentTxnId"
          type="text"
          {...register("advPaymentTxnId", {
            required: "Advance payment transaction ID is required",
          })}
          className={`form-input ${errors.advPaymentTxnId ? "border-red-500" : ""}`}
          placeholder="Enter advance payment transaction ID"
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.advPaymentTxnId && (
            <p className="text-red-500 text-xs">{errors.advPaymentTxnId.message}</p>
          )}
        </div>
      </FormField>
      <FormField label="Advance Payment Date">
        <input
          id="advPaymentDate"
          type="date"
          {...register("advPaymentDate", {
            required: "Advance payment date is required",
          })}
          className={`form-input ${errors.advPaymentDate ? "border-red-500" : ""}`}
          placeholder="Enter advance payment date"
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.advPaymentDate && (
            <p className="text-red-500 text-xs">{errors.advPaymentDate.message}</p>
          )}
        </div>
      </FormField>
    </FormRow>
    <div className="h-4" />
    <FormRow>
      {/* Infant Fees Field */}
      <FormField label={TICKET_FORM_LABELS.INFANT_FEES || "Infant Fees"}>
        <input
          id="infantFees"
          type="number"
          step="0.01"
          min="0"
          {...register("infantFees", {
            required: "Infant fees is required",
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          defaultValue={formData.infantFees || 0}
          className={`form-input ${errors.infantFees ? "border-red-500" : ""}`}
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.infantFees && (
            <span className="text-red-500 text-xs">
              {errors.infantFees.message}
            </span>
          )}
        </div>
      </FormField>
      <FormField label={TICKET_FORM_LABELS.OUTSTANDING}>
        <input
          id="outstanding"
          type="number"
          {...register("outstanding", {
            required: "Outstanding is required",
            min: {
              value: 0,
              message: TICKET_FORM_VALIDATION.CANNOT_BE_NEGATIVE,
            },
          })}
          className={`form-input ${errors.outstanding ? "border-red-500" : ""}`}
          placeholder={TICKET_FORM_PLACEHOLDERS.OUTSTANDING}
          readOnly
          disabled={readOnly}
        />
        <div className="h-4">
          {errors.outstanding && (
            <p className="text-red-500 text-xs">{errors.outstanding.message}</p>
          )}
        </div>
      </FormField>
    </FormRow>
    {(formData.purchasePrice > 0 ||
      formData.totalSeats > 0 ||
      formData.advPaidAmount > 0) && (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
        <h4 className="text-xs font-semibold text-gray-800 mb-2">
          {TICKET_FORM_OTHER.CALCULATION_SUMMARY}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
          <div>
            <span className="font-medium">
              {TICKET_FORM_OTHER.PURCHASE_PRICE}
            </span>{" "}
            {formatCurrency(formData.purchasePrice || 0)}
          </div>
          <div>
            <span className="font-medium">{TICKET_FORM_OTHER.TOTAL_SEATS}</span>{" "}
            {formData.totalSeats || 0}
          </div>
          <div>
            <span className="font-medium">{TICKET_FORM_OTHER.TOTAL_PRICE}</span>{" "}
            {formatCurrency(formData.totalPrice || 0)}
          </div>
          <div>
            <span className="font-medium">{TICKET_FORM_OTHER.ADVANCE_PAID}</span>{" "}
            {formatCurrency(formData.advPaidAmount || 0)}
          </div>
          <div>
            <span className="font-medium">
              {TICKET_FORM_OTHER.OUTSTANDING}
            </span>{" "}
            {formatCurrency(formData.outstanding || 0)}
          </div>
          {/* <div>
            <span className="font-medium">{TICKET_FORM_OTHER.BALANCE}</span>{" "}
            {formatCurrency(
              (formData.totalPrice || 0) -
                (formData.advPaidAmount || 0) -
                (formData.outstanding || 0)
            )}
          </div> */}
        </div>
      </div>
    )}
  </FormSection>
); 