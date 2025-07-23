"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FormHeader } from "./sections/FormHeader";
import { useTicketForm } from "@/hooks/useTicketForm";
import { formatDate, formatTime } from "@/utils/formatters";
import { TICKET_FORM_BUTTONS } from "@/constants/ticketFormConstants";
import { ScheduleClassSection } from "./sections/ScheduleClassSection";
import { JourneyDetailsSection } from "./sections/JourneyDetailsSection";
import { PaymentDetailsSection } from "./sections/PaymentDetailsSection";
import { ImportantDatesSection } from "./sections/ImportantDatesSection";
import { BaggageDetailsSection } from "./sections/BaggageDetailsSection";
import {
  validateTicketCalculations,
  autoCalculateTicketAmounts,
} from "@/utils/ticketCalculations";
import "react-datepicker/dist/react-datepicker.css";

export default function TicketForm({
  onSubmit,
  initialData = {},
  loading,
  isEditMode = false,
  tickets = [],
  readOnly = false,
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, errors, formData, setValue, watch } =
    useTicketForm({ initialData, isEditMode, onSubmit, tickets });

  const journeyType = watch("journeyType");

  useEffect(() => {
    if (journeyType === "Domestic") {
      setValue("handBaggage", 7);
      setValue("checkedBaggage", 15);
      setValue("infantFees", 1750);
    } else if (journeyType === "International") {
      setValue("handBaggage", 7);
      setValue("checkedBaggage", 20);
    }
  }, [journeyType, setValue]);

  const handleBack = () => {
    router.push("/admin/tickets");
  };

  const handleFormSubmitWithValidation = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const validation = validateTicketCalculations(data);
      if (!validation.isValid) {
        toast.error(`Validation errors: ${validation.errors.join(", ")}`);
        setIsSubmitting(false);
        return;
      }

      const calculatedData = autoCalculateTicketAmounts(data, "auto");

      const formattedData = {
        ...calculatedData,
        formattedDateOfJourney: formatDate(
          calculatedData.dateOfJourney,
          "ticket-details"
        ),
        formattedDepartureTime: formatTime(calculatedData.departureTime),
        formattedArrivalTime: formatTime(calculatedData.arrivalTime),
        advPaymentTxnId: calculatedData.advPaymentTxnId,
        advPaymentDate: calculatedData.advPaymentDate,
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error.message ||
          `Failed to ${
            isEditMode ? "update" : "add"
          } ticket. Please check your data.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-2">
      <FormHeader
        onBack={handleBack}
        isEditMode={isEditMode}
        readOnly={readOnly}
      />
      <form
        onSubmit={handleSubmit(handleFormSubmitWithValidation)}
        className="space-y-2"
      >
        <JourneyDetailsSection
          register={register}
          control={control}
          errors={errors}
          formData={formData}
          isEditMode={isEditMode}
          initialData={initialData}
          tickets={tickets}
          setValue={setValue}
          watch={watch}
          readOnly={readOnly}
        />
        <ScheduleClassSection
          control={control}
          errors={errors}
          register={register}
          readOnly={readOnly}
        />
        <BaggageDetailsSection
          register={register}
          errors={errors}
          formData={formData}
          readOnly={readOnly}
        />
        <PaymentDetailsSection
          register={register}
          errors={errors}
          formData={formData}
          readOnly={readOnly}
        />
        <ImportantDatesSection
          control={control}
          errors={errors}
          register={register}
          formData={formData}
          readOnly={readOnly}
        />
        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-1.5 bg-gray-300 text-gray-800 rounded font-semibold hover:bg-gray-400 transition-colors text-sm"
            >
              {TICKET_FORM_BUTTONS.CANCEL}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-5 py-1.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors text-sm"
            >
              {loading || isSubmitting ? (
                <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-white"></div>
              ) : isEditMode ? (
                TICKET_FORM_BUTTONS.UPDATE_TICKET
              ) : (
                TICKET_FORM_BUTTONS.ADD_TICKET
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
