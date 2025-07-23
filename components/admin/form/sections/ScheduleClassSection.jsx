import React from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import SearchableDropdown from "../SearchableDropdown";
import { FormSection, FormRow, FormField } from "../FormLayout";
import {
  TICKET_FORM_LABELS,
  TICKET_FORM_PLACEHOLDERS,
  TICKET_FORM_VALIDATION,
  TICKET_FORM_SECTIONS,
} from "@/constants/ticketFormConstants";

export const ScheduleClassSection = ({
  control,
  errors,
  register,
  readOnly = false,
}) => {
  const hasConnectingFlights = control._formValues?.hasConnectingFlights;

  return (
    <FormSection title={TICKET_FORM_SECTIONS.SCHEDULE_CLASS}>
      <div
        className={`grid gap-6 mb-6 ${
          hasConnectingFlights ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        <div>
          <FormField label={TICKET_FORM_LABELS.DEPARTURE_LOCATION}>
            <Controller
              name="departureLocation"
              control={control}
              rules={{
                required: TICKET_FORM_VALIDATION.DEPARTURE_LOCATION_REQUIRED,
              }}
              render={({ field }) => (
                <SearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={TICKET_FORM_PLACEHOLDERS.DEPARTURE_LOCATION}
                  type="location"
                  error={errors.departureLocation}
                  disabled={readOnly}
                  className="w-full min-w-[180px]"
                />
              )}
            />
            <div className="h-4">
              {errors.departureLocation && (
                <p className="text-red-500 text-xs">
                  {errors.departureLocation.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
        {/* Arrival Location */}
        <div>
          <FormField label={TICKET_FORM_LABELS.ARRIVAL_LOCATION}>
            <Controller
              name="arrivalLocation"
              control={control}
              rules={{
                required: TICKET_FORM_VALIDATION.ARRIVAL_LOCATION_REQUIRED,
              }}
              render={({ field }) => (
                <SearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={TICKET_FORM_PLACEHOLDERS.ARRIVAL_LOCATION}
                  type="location"
                  error={errors.arrivalLocation}
                  disabled={readOnly}
                  className="w-full min-w-[180px]"
                />
              )}
            />
            <div className="h-4">
              {errors.arrivalLocation && (
                <p className="text-red-500 text-xs">
                  {errors.arrivalLocation.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
        {/* Checkbox for Connecting Flight(s)? */}
        <div>
          <FormField label="Connecting Flight(s)?">
            <Controller
              name="hasConnectingFlights"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <div className="flex items-center h-full mt-2">
                  <input
                    type="checkbox"
                    id="hasConnectingFlights"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}
            />
          </FormField>
        </div>
      
        {hasConnectingFlights && (
          <div>
            <FormField label="Connecting Location">
              <Controller
                name="connectingLocation"
                control={control}
                defaultValue={""}
                render={({ field }) => (
                  <SearchableDropdown
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select connecting location"
                    type="location"
                    error={errors.connectingLocation}
                    disabled={readOnly}
                    className="w-full min-w-[180px]"
                  />
                )}
              />
              <div className="h-4">
                {errors.connectingLocation && (
                  <p className="text-red-500 text-xs">
                    {errors.connectingLocation.message}
                  </p>
                )}
              </div>
            </FormField>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
      
        <div>
          <FormField label={TICKET_FORM_LABELS.DATE_OF_JOURNEY}>
            <input
              id="dateOfJourney"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("dateOfJourney", {
                required: TICKET_FORM_VALIDATION.DATE_OF_JOURNEY_REQUIRED,
                validate: {
                  futureDate: (value) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      new Date(value) >= today ||
                      TICKET_FORM_VALIDATION.DATE_IN_FUTURE
                    );
                  },
                },
              })}
              className={`form-input w-full min-w-[150px] ${
                errors.dateOfJourney ? "border-red-500" : ""
              }`}
              disabled={readOnly}
            />
            <div className="h-4">
              {errors.dateOfJourney && (
                <p className="text-red-500 text-xs">
                  {errors.dateOfJourney.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
        <div>
          <FormField label={TICKET_FORM_LABELS.DEPARTURE_TIME}>
            <Controller
              name="departureTime"
              control={control}
              rules={{ required: "Departure time is required" }}
              render={({ field }) => {
                const timeStringToDate = (timeString) => {
                  if (!timeString || typeof timeString !== "string")
                    return null;
                  const [hours, minutes] = timeString.split(":");
                  const date = new Date();
                  date.setHours(
                    parseInt(hours, 10),
                    parseInt(minutes, 10),
                    0,
                    0
                  );
                  return date;
                };

                const dateToTimeString = (date) => {
                  if (!date) return "";
                  const hours = date.getHours().toString().padStart(2, "0");
                  const minutes = date.getMinutes().toString().padStart(2, "0");
                  return `${hours}:${minutes}`;
                };

                return (
                  <DatePicker
                    selected={timeStringToDate(field.value)}
                    onChange={(date) => field.onChange(dateToTimeString(date))}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={1}
                    timeFormat="HH:mm"
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="form-input w-full min-w-[150px]"
                    placeholderText="HH:MM"
                    autoComplete="off"
                    disabled={readOnly}
                  />
                );
              }}
            />
            <div className="h-4">
              {errors.departureTime && (
                <p className="text-red-500 text-xs">
                  {errors.departureTime.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
        <div>
          <FormField label={TICKET_FORM_LABELS.ARRIVAL_TIME}>
            <Controller
              name="arrivalTime"
              control={control}
              rules={{ required: "Arrival time is required" }}
              render={({ field }) => {
                const timeStringToDate = (timeString) => {
                  if (!timeString || typeof timeString !== "string")
                    return null;
                  const [hours, minutes] = timeString.split(":");
                  const date = new Date();
                  date.setHours(
                    parseInt(hours, 10),
                    parseInt(minutes, 10),
                    0,
                    0
                  );
                  return date;
                };

                const dateToTimeString = (date) => {
                  if (!date) return "";
                  const hours = date.getHours().toString().padStart(2, "0");
                  const minutes = date.getMinutes().toString().padStart(2, "0");
                  return `${hours}:${minutes}`;
                };

                return (
                  <DatePicker
                    selected={timeStringToDate(field.value)}
                    onChange={(date) => field.onChange(dateToTimeString(date))}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={1}
                    timeFormat="HH:mm"
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="form-input w-full min-w-[150px]"
                    placeholderText="HH:MM"
                    autoComplete="off"
                    disabled={readOnly}
                  />
                );
              }}
            />
            <div className="h-4">
              {errors.arrivalTime && (
                <p className="text-red-500 text-xs">
                  {errors.arrivalTime.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
        {/* Class */}
        <div>
          <FormField label="Class *">
            <select
              id="classType"
              {...register("classType", { required: "Class type is required" })}
              className={`form-input w-full min-w-[150px] ${
                errors.classType ? "border-red-500" : ""
              }`}
              disabled={readOnly}
            >
              <option value="">Select Class</option>
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business Class">Business Class</option>
              <option value="First Class">First Class</option>
            </select>
            <div className="h-4">
              {errors.classType && (
                <p className="text-red-500 text-xs">
                  {errors.classType.message}
                </p>
              )}
            </div>
          </FormField>
        </div>
      </div>
    </FormSection>
  );
};
