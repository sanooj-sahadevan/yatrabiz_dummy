import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice, formatDate } from "@/utils/formatters";
import { TICKET_MESSAGES } from "@/constants/ticketConstants";
import React, { useEffect, useState } from "react";
import { BOOKING_FORM_TEXT } from "@/constants/bookingConstants";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PaymentSelectionModal } from "./modals";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PassengerError = ({ error }) => (
  <p className="text-xs min-h-[1.25rem] text-red-500 mt-0.5">
    {error ? error.message : "\u00A0"}
  </p>
);

const BookingForm = ({
  ticket,
  isBooking,
  handleSubmit,
  formHandleSubmit,
  register,
  errors,
  fields,
  passengerCount,
  isValid,
  watch,
  setValue,
  infants,
  setInfants,
}) => {
  const today = formatDate(new Date(), "default");
  const minDob = formatDate(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
    "default"
  );
  const isInternational = ticket?.journeyType === "International";

  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setPendingFormData(data);
    setShowPaymentModal(true);
  };

  const handlePayLater = async () => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    const infantsWithNames = infants.map((infant) => {
      const associatedField = fields.find(
        (f) => f.id === infant.associatedPassenger
      );
      const fname = associatedField
        ? watch(`passengers.${fields.indexOf(associatedField)}.firstName`)
        : "";
      const lname = associatedField
        ? watch(`passengers.${fields.indexOf(associatedField)}.lastName`)
        : "";
      return {
        ...infant,
        type: "Infant",
        associatedPassengerName: `${fname} ${lname}`.trim(),
      };
    });
    const passengersWithType = pendingFormData.passengers.map((p) => {
      let type = "Adult";
      if (["Master", "Miss"].includes(p.honorific)) {
        type = "Kid";
      }
      return { ...p, type };
    });
    await handleSubmit({
      ...pendingFormData,
      passengers: passengersWithType,
      infants: infantsWithNames,
      totalAmount: calculateTotalWithInfantFees(),
    });
    setIsSubmitting(false);
    router.push("/my-bookings");
  };

  const handlePayNow = () => {
    setPaymentChoice("now");
  };

  const handlePayNowSubmit = async () => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    const infantsWithNames = infants.map((infant) => {
      const associatedField = fields.find(
        (f) => f.id === infant.associatedPassenger
      );
      const fname = associatedField
        ? watch(`passengers.${fields.indexOf(associatedField)}.firstName`)
        : "";
      const lname = associatedField
        ? watch(`passengers.${fields.indexOf(associatedField)}.lastName`)
        : "";
      return {
        ...infant,
        type: "Infant",
        associatedPassengerName: `${fname} ${lname}`.trim(),
      };
    });
    const passengersWithType = pendingFormData.passengers.map((p) => {
      let type = "Adult";
      if (["Master", "Miss"].includes(p.honorific)) {
        type = "Kid";
      }
      return { ...p, type };
    });
    await handleSubmit({
      ...pendingFormData,
      passengers: passengersWithType,
      infants: infantsWithNames,
      totalAmount: calculateTotalWithInfantFees(),
    });
    setIsSubmitting(false);
    router.push("/my-bookings");
  };

  React.useEffect(() => {
    fields.forEach((field, index) => {
      const honorific = watch(`passengers.${index}.honorific`);
      if (!honorific) {
        setValue(`passengers.${index}.honorific`, "Mr.");
      }
    });
  }, [fields, watch, setValue]);

  const handleAddInfantRow = () => {
    if (infants.length < passengerCount) {
      setInfants((prev) => [
        ...prev,
        { firstName: "", lastName: "", dob: "", associatedPassenger: "" },
      ]);
    }
  };
  const handleRemoveInfantRow = (idx) => {
    setInfants((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleInfantFieldChange = (idx, name, value) => {
    setInfants((prev) =>
      prev.map((infant, i) =>
        i === idx ? { ...infant, [name]: value } : infant
      )
    );
  };
  const getPricePerSeat = () =>
    Number(ticket.Discount) > 0
      ? Number(ticket.Discount)
      : Number(ticket.salePrice) || 0;
  const calculateTotalWithInfantFees = () => {
    const pricePerSeat = getPricePerSeat();
    const infantFee = Number(ticket.infantFees) || 0;
    return pricePerSeat * passengerCount + infants.length * infantFee;
  };
  const areAllInfantFieldsFilled = infants.every(
    (infant) =>
      infant.firstName &&
      infant.lastName &&
      infant.dob &&
      infant.associatedPassenger
  );

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const formatDateLocal = (date) => formatDate(date, "default");

  const todayDate = new Date();
  const todayStr = formatDate(todayDate, "default");
  const minAdultDob = formatDate(
    new Date(
      todayDate.getFullYear() - 150,
      todayDate.getMonth(),
      todayDate.getDate()
    ),
    "default"
  );
  const maxAdultDob = formatDate(
    new Date(
      todayDate.getFullYear() - 18,
      todayDate.getMonth(),
      todayDate.getDate() - 1
    ),
    "default"
  );
  const minMasterDobDate = new Date(
    todayDate.getFullYear() - 18,
    todayDate.getMonth(),
    todayDate.getDate()
  );
  const maxMasterDobDate = todayDate;
  const minInfantDobDate = new Date(
    todayDate.getFullYear() - 2,
    todayDate.getMonth(),
    todayDate.getDate()
  );
  const maxInfantDobDate = todayDate;
  const minPassportExpiry = formatDate(addMonths(todayDate, 6), "default");

  const associatedPassengerIds = infants
    .map((i) => i.associatedPassenger)
    .filter(Boolean);

  if (!ticket || !ticket.availableSeats || ticket.availableSeats <= 0) {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {BOOKING_FORM_TEXT.ERROR_NO_SEATS}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2 text-center">
          {BOOKING_FORM_TEXT.HEADING}
        </h2>

        <form
          onSubmit={formHandleSubmit(onSubmit)}
          className="flex flex-col gap-1.5"
        >
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="numberOfSeats"
              className="block text-sm font-medium text-gray-700"
            >
              {BOOKING_FORM_TEXT.LABEL_NUMBER_OF_PASSENGERS}
            </label>
            <div className="relative w-20">
              <select
                id="numberOfSeats"
                {...register("numberOfSeats")}
                className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                disabled={isBooking}
              >
                {[...Array(ticket.availableSeats)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}{" "}
                    {i === 0
                      ? TICKET_MESSAGES.UI.PASSENGER
                      : TICKET_MESSAGES.UI.PASSENGERS}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 8L10 12L14 8"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <h4 className="text-md font-semibold mb-1">
              {BOOKING_FORM_TEXT.LABEL_PASSENGER_DETAILS}
            </h4>
            <p className="text-xs mb-1 text-gray-700">
              {BOOKING_FORM_TEXT.PASSENGER_DETAILS_NOTE}
            </p>
            {fields.map((field, index) => {
              const showDob =
                isInternational ||
                ["Miss", "Master"].includes(
                  watch(`passengers.${index}.honorific`)
                );
              const showInternational = isInternational;

              let fieldCount = 3;
              if (showDob) fieldCount++;
              if (showInternational) fieldCount += 3;

              const fieldClass = `flex flex-col flex-1 min-w-[120px]`;
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: index * 0.08,
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 flex flex-col md:flex-row flex-wrap gap-1.5 items-end shadow-sm w-full"
                >
                  <div className="flex flex-col w-24 min-w-[80px] max-w-[100px]">
                    <label className="text-xs font-medium mb-0.5">
                      Honorific
                    </label>
                    <select
                      {...register(`passengers.${index}.honorific`, {
                        required: true,
                      })}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      disabled={isBooking}
                    >
                      {["Mr.", "Mrs.", "Ms.", "Master", "Miss"].map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                    <PassengerError
                      error={errors.passengers?.[index]?.honorific}
                    />
                  </div>
                  <div className={fieldClass + " w-full md:w-auto"}>
                    <label className="text-xs font-medium mb-0.5">
                      First Name
                    </label>
                    <input
                      {...register(`passengers.${index}.firstName`, {
                        required: true,
                      })}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First Name"
                      disabled={isBooking}
                    />
                    <PassengerError
                      error={errors.passengers?.[index]?.firstName}
                    />
                  </div>
                  <div className={fieldClass + " w-full md:w-auto"}>
                    <label className="text-xs font-medium mb-0.5">
                      Last Name
                    </label>
                    <input
                      {...register(`passengers.${index}.lastName`, {
                        required: true,
                      })}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last Name"
                      disabled={isBooking}
                    />
                    <PassengerError
                      error={errors.passengers?.[index]?.lastName}
                    />
                  </div>
                  {showDob && (
                    <div className={fieldClass + " w-full md:w-auto"}>
                      <label className="text-xs font-medium mb-0.5">
                        Date of Birth
                      </label>
                      {['Master', 'Miss'].includes(watch(`passengers.${index}.honorific`)) ? (
                        <DatePicker
                          selected={
                            watch(`passengers.${index}.dob`)
                              ? new Date(watch(`passengers.${index}.dob`))
                              : null
                          }
                          onChange={(date) =>
                            setValue(
                              `passengers.${index}.dob`,
                              date ? formatDate(date, "default") : ""
                            )
                          }
                          minDate={minMasterDobDate}
                          maxDate={maxMasterDobDate}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="DOB"
                          className="px-2 py-1 border border-gray-300 rounded-md w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          required
                        />
                      ) : (
                        <input
                          type="date"
                          min={
                            watch(`passengers.${index}.honorific`) === "Mr." ||
                            watch(`passengers.${index}.honorific`) === "Mrs."
                              ? minAdultDob
                              : watch(`passengers.${index}.honorific`) ===
                                "Infant"
                              ? minInfantDobDate.toISOString().split("T")[0]
                              : minAdultDob
                          }
                          max={
                            watch(`passengers.${index}.honorific`) === "Mr." ||
                            watch(`passengers.${index}.honorific`) === "Mrs."
                              ? maxAdultDob
                              : watch(`passengers.${index}.honorific`) ===
                                "Infant"
                              ? maxInfantDobDate.toISOString().split("T")[0]
                              : maxAdultDob
                          }
                          {...register(`passengers.${index}.dob`, {
                            required: true,
                            validate: (value) => {
                              const dob = new Date(value);
                              if (
                                (watch(`passengers.${index}.honorific`) ===
                                  "Mr." ||
                                  watch(`passengers.${index}.honorific`) ===
                                    "Mrs.") &&
                                (dob >=
                                  new Date(
                                    todayDate.getFullYear() - 18,
                                    todayDate.getMonth(),
                                    todayDate.getDate()
                                  ) ||
                                  dob <
                                    new Date(
                                      todayDate.getFullYear() - 150,
                                      todayDate.getMonth(),
                                      todayDate.getDate()
                                    ))
                              ) {
                                return "Must be older than 18 years";
                              }
                              if (
                                watch(`passengers.${index}.honorific`) ===
                                  "Infant" &&
                                (dob < minInfantDobDate ||
                                  dob > maxInfantDobDate)
                              ) {
                                return "Age must be less than 2 years";
                              }
                              return true;
                            },
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="DOB"
                          disabled={isBooking}
                        />
                      )}
                      <PassengerError error={errors.passengers?.[index]?.dob} />
                    </div>
                  )}
                  {showInternational && (
                    <>
                      <div className={fieldClass + " w-full md:w-auto"}>
                        <label className="text-xs font-medium mb-0.5">
                          Passport Number
                        </label>
                        <input
                          {...register(`passengers.${index}.passportNumber`, {
                            required: true,
                            minLength: {
                              value: 6,
                              message:
                                "Passport number must be at least 6 characters",
                            },
                            maxLength: {
                              value: 20,
                              message:
                                "Passport number must be at most 20 characters",
                            },
                            pattern: {
                              value: /^[A-Za-z0-9]+$/,
                              message: "Passport number must be alphanumeric",
                            },
                            validate: (value) => {
                              if (/^(.)\1+$/.test(value)) {
                                return "Passport number cannot be all the same character";
                              }
                              return true;
                            },
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Passport Number"
                          disabled={isBooking}
                        />
                        <PassengerError
                          error={errors.passengers?.[index]?.passportNumber}
                        />
                      </div>
                      <div className={fieldClass + " w-full md:w-auto"}>
                        <label className="text-xs font-medium mb-0.5">
                          Passport Expiry
                        </label>
                        <DatePicker
                          selected={
                            watch(`passengers.${index}.passportExpiry`)
                              ? new Date(
                                  watch(`passengers.${index}.passportExpiry`)
                                )
                              : null
                          }
                          onChange={(date) =>
                            setValue(
                              `passengers.${index}.passportExpiry`,
                              date ? formatDate(date, "default") : ""
                            )
                          }
                          minDate={addMonths(todayDate, 6)}
                          dateFormat="dd MMMM yyyy"
                          placeholderText={`Select date (min: ${minPassportExpiry})`}
                          className="px-2 py-1 border border-gray-300 rounded-md w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          required
                        />
                        <PassengerError
                          error={errors.passengers?.[index]?.passportExpiry}
                        />
                      </div>
                      <div className={fieldClass + " w-full md:w-auto"}>
                        <label className="text-xs font-medium mb-0.5">
                          Nationality
                        </label>
                        <input
                          {...register(`passengers.${index}.nationality`, {
                            required: true,
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nationality"
                          disabled={isBooking}
                        />
                        <PassengerError
                          error={errors.passengers?.[index]?.nationality}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Infants Section - Improved UI */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <button
                type="button"
                className="border bg-background text-white px-3 py-1 rounded hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed font-medium text-sm"
                onClick={handleAddInfantRow}
                disabled={infants.length >= passengerCount}
                title={
                  infants.length >= passengerCount
                    ? "Max infants reached (equal to number of passengers)"
                    : "Add Infant"
                }
              >
                Infant +
              </button>
            </div>
            {infants.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                {infants.map((infant, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row flex-wrap gap-1.5 items-end bg-gray-50 border border-gray-200 rounded-xl p-1.5 relative w-full"
                  >
                    <div className="flex flex-col flex-1 min-w-[120px]">
                      <label className="text-xs font-medium mb-0.5">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        value={infant.firstName}
                        onChange={(e) =>
                          handleInfantFieldChange(
                            idx,
                            "firstName",
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="First Name"
                        required
                      />
                      <span className="text-xs text-red-500 mt-0.5 min-h-[1.25rem] block">
                        {"\u00A0"}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[120px]">
                      <label className="text-xs font-medium mb-0.5">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={infant.lastName}
                        onChange={(e) =>
                          handleInfantFieldChange(
                            idx,
                            "lastName",
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="Last Name"
                        required
                      />
                      <span className="text-xs text-red-500 mt-0.5 min-h-[1.25rem] block">
                        {/* Add validation message here if needed, else non-breaking space */}
                        {"\u00A0"}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[140px]">
                      <label className="text-xs font-medium mb-0.5">DOB</label>
                      <DatePicker
                        selected={infant.dob ? new Date(infant.dob) : null}
                        onChange={(date) =>
                          handleInfantFieldChange(
                            idx,
                            "dob",
                            date ? formatDate(date, "default") : ""
                          )
                        }
                        minDate={minInfantDobDate}
                        maxDate={maxInfantDobDate}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="DOB"
                        className="px-2 py-1 border border-gray-300 rounded-md w-full"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        required
                      />
                      <span className="text-xs text-red-500 mt-0.5 min-h-[1.25rem] block">
                        {/* Add validation message here if needed, else non-breaking space */}
                        {"\u00A0"}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[220px]">
                      <label className="text-xs font-medium mb-0.5">
                        Associated Passenger
                      </label>
                      <select
                        name="associatedPassenger"
                        value={infant.associatedPassenger}
                        onChange={(e) =>
                          handleInfantFieldChange(
                            idx,
                            "associatedPassenger",
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded-md w-full max-w-full"
                        required
                      >
                        <option value="">Add the associated passenger</option>
                        {fields.map((field, pidx) => {
                          const fname =
                            watch(`passengers.${pidx}.firstName`) || "";
                          const lname =
                            watch(`passengers.${pidx}.lastName`) || "";
                          const passengerName = `${fname} ${lname}`.trim();
                          const isAssociated = associatedPassengerIds.includes(
                            field.id
                          );
                          const isCurrentlySelected =
                            infant.associatedPassenger === field.id;

                          return (
                            <option
                              key={field.id}
                              value={field.id}
                              disabled={isAssociated && !isCurrentlySelected}
                            >
                              {passengerName}
                              {isAssociated && !isCurrentlySelected
                                ? " (Already assigned)"
                                : ""}
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-xs text-red-500 mt-0.5 min-h-[1.25rem] block">
                        {!infant.associatedPassenger ||
                        infant.associatedPassenger === ""
                          ? "Add the associated passenger"
                          : "\u00A0"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-black px-2 py-1 rounded hover:bg-gray-200"
                      onClick={() => handleRemoveInfantRow(idx)}
                      title="Remove Infant"
                    >
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-4 h-4 text-red-600 mt-1"
                        whileTap={{
                          rotate: 180,
                          transition: { duration: 0.5 },
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </motion.svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-200 my-2">
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between items-center text-base font-semibold">
                <span>{BOOKING_FORM_TEXT.LABEL_TOTAL_AMOUNT}</span>
                <motion.span
                  key={calculateTotalWithInfantFees()}
                  initial={{ scale: 0.9, color: "#166534", opacity: 0 }}
                  animate={{ scale: 1, color: "#166534", opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-green-900"
                >
                  {formatPrice(calculateTotalWithInfantFees())}
                </motion.span>
              </div>
              {/* Breakdown for infants if any */}
              <div className="flex justify-between items-center text-[10px] text-gray-600 mt-0 mb-0 py-0">
                <span className="flex items-center gap-2">
                  {passengerCount} Passenger{passengerCount > 1 ? "s" : ""} x{" "}
                  {Number(ticket.Discount) > 0 ? (
                    <>
                      <span className="text-gray-400 line-through text-xs mr-1">
                        {formatPrice(ticket.salePrice)}
                      </span>
                      <motion.span
                        className="text-green-700 font-bold text-base"
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{ scale: 1.08, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        }}
                      >
                        {formatPrice(ticket.Discount)}
                      </motion.span>
                    </>
                  ) : (
                    <span className="text-gray-600  ">
                      {formatPrice(getPricePerSeat())}
                    </span>
                  )}
                  {infants.length > 0 && (
                    <>
                      {"  +  "}
                      {infants.length} Infant{infants.length > 1 ? "s" : ""} x{" "}
                      {formatPrice(Number(ticket.infantFees) || 0)}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={
              isBooking ||
              passengerCount === 0 ||
              !isValid ||
              (infants.length > 0 && !areAllInfantFieldsFilled)
            }
            className=" py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium w-full"
            style={{ backgroundColor: "#0A2239", color: "white" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {isBooking ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" fullScreen={false} message="" />
                <span className="ml-2">{TICKET_MESSAGES.UI.PROCESSING}</span>
              </div>
            ) : (
              BOOKING_FORM_TEXT.BUTTON_BOOK(
                passengerCount,
                TICKET_MESSAGES.UI.TICKET,
                TICKET_MESSAGES.UI.TICKETS
              )
            )}
          </motion.button>
        </form>
      </motion.div>
      <PaymentSelectionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={calculateTotalWithInfantFees()}
        onPayNow={handlePayNow}
        onPayLater={handlePayLater}
        onPayNowSubmit={handlePayNowSubmit}
        isSubmitting={isSubmitting}
        paymentChoice={paymentChoice}
        setPaymentChoice={setPaymentChoice}
      />
    </>
  );
};

export default BookingForm;
