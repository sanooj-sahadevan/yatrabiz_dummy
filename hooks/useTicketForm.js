import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { generateUniquePNR } from "@/utils/pnrUtils";
import {
  calculateTotalPrice,
  calculateOutstandingAmount,
} from "@/utils/ticketCalculations";

export function useTicketForm({
  initialData = {},
  isEditMode = false,
  onSubmit,
  tickets = [],
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: initialData,
    mode: "onChange",
  });

  const purchasePrice = watch("purchasePrice");
  const totalSeats = watch("totalSeats");
  const advPaidAmount = watch("advPaidAmount");
  const totalPrice = watch("totalPrice");
  const availableSeats = watch("availableSeats");
  const outstanding = watch("outstanding");
  const generatePNR = watch("generatePNR");
  const isOriginalPNR = watch("isOriginalPNR");
  const formData = watch();

  useEffect(() => {
    if (generatePNR) {
      const newPNR = generateUniquePNR(tickets);
      setValue("PNR", newPNR);
      clearErrors("PNR");
    } else {
      if (!isEditMode) {
        setValue("PNR", "");
      }
    }
  }, [generatePNR, setValue, clearErrors, isEditMode, tickets]);

  useEffect(() => {
    if (initialData) {
      for (const key in initialData) {
        if (Object.prototype.hasOwnProperty.call(initialData, key)) {
          setValue(key, initialData[key]);
        }
      }
    }
  }, [initialData, setValue]);
  useEffect(() => {
    const newTotalPrice = calculateTotalPrice(purchasePrice, totalSeats);
    if (newTotalPrice !== totalPrice) {
      setValue("totalPrice", newTotalPrice, { shouldDirty: true });
    }
  }, [purchasePrice, totalSeats, totalPrice, setValue]);
  useEffect(() => {
    const newOutstanding = calculateOutstandingAmount(
      totalPrice,
      advPaidAmount
    );
    if (newOutstanding !== outstanding) {
      setValue("outstanding", newOutstanding, { shouldDirty: true });
    }
  }, [totalPrice, advPaidAmount, outstanding, setValue]);
  useEffect(() => {
    if (!isEditMode) {
      setValue("availableSeats", totalSeats, { shouldDirty: true });
    }
  }, [totalSeats, isEditMode, setValue]);
  useEffect(() => {
    if (
      totalSeats &&
      availableSeats &&
      parseInt(availableSeats, 10) > parseInt(totalSeats, 10)
    ) {
      setValue("availableSeats", totalSeats, { shouldDirty: true });
    }
  }, [availableSeats, totalSeats, setValue]);

  const handleFormSubmit = (data) => {
    const submittedData = { ...data };
    if (submittedData.generatePNR) {
      submittedData.isDummyPNR = true;
    }
    delete submittedData.generatePNR;

    if (isEditMode && submittedData.isOriginalPNR) {
      submittedData.isDummyPNR = false;
    }
    delete submittedData.isOriginalPNR;
    // Ensure connectingLocation is always present in the payload
    if (!submittedData.hasConnectingFlights) {
      submittedData.connectingLocation = null;
    }
    onSubmit(submittedData);
  };

  return {
    register,
    handleSubmit,
    control,
    watch,
    errors,
    formData,
    handleFormSubmit,
    setValue,
  };
}
