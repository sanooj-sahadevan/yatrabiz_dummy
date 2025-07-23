"use client";
import { useState, useEffect } from "react";
import AGTable from "@/components/admin/table/AGGrid";
import { TABLE_CONTEXTS } from "@/constants/tableConstants"
import {
  ALL_AUDITLOG_COLUMNS,
  BOOKING_REQUEST_AUDITLOG_COLUMNS,
  SEARCH_HISTORY_COLUMNS,
  PASSENGER_NAME_EDIT_AUDITLOG_COLUMNS,
} from "@/constants/tableColumns";
import {
  fetchAdminAudit,
  fetchAirlineAudit,
  fetchLocationAudit,
  fetchTicketAudit,
  fetchBookingRequestAudit,
  fetchSearchHistory,
  fetchPassengerNameEditAuditLog,
} from "@/lib/apiClient";

export default function AuditPage() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("admin");
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [bookingRequestAuditLogs, setBookingRequestAuditLogs] = useState([]);
  const [searchHistoryLogs, setSearchHistoryLogs] = useState([]);
  const [passengerNameEditAuditLogs, setPassengerNameEditAuditLogs] = useState(
    []
  );

  const handleDropdownChange = (value) => {
    setSelectedDropdownValue(value);
  };

  const fetchAuditData = async () => {
    try {
      setLoading(true);

      const [
        adminRes,
        airlineRes,
        locationRes,
        ticketRes,
        bookingRequestRes,
        searchHistoryRes,
        passengerNameEditRes,
      ] = await Promise.all([
        fetchAdminAudit(),
        fetchAirlineAudit(),
        fetchLocationAudit(),
        fetchTicketAudit(),
        fetchBookingRequestAudit(),
        fetchSearchHistory(),
        fetchPassengerNameEditAuditLog(),
      ]);

      const results = {
        admin: adminRes.data || adminRes || [],
        airline: airlineRes.data || airlineRes || [],
        location: locationRes.data || locationRes || [],
        ticket: ticketRes.data || ticketRes || [],
        bookingRequest: bookingRequestRes.data || bookingRequestRes || [],
        searchHistory: searchHistoryRes.data || searchHistoryRes || [],
        passengerNameEdit:
          passengerNameEditRes.data || passengerNameEditRes || [],
      };

      const combinedAuditLogs = [
        ...results.admin.map((log) => ({
          ...log,
          type: "Admin",
          adminEmail: log.changedBy,
          entityName: log.person?.email || log.person?.name || "N/A",
        })),
        ...results.airline.map((log) => ({
          ...log,
          type: "Airline",
          adminEmail: log.adminId?.email || "N/A",
          entityName: (() => {
            if (log.airline?.name) {
              return log.airline.name;
            }
            if (typeof log.airline === "object" && log.airline !== null) {
              return (
                log.airline.name || log.airline.code || log.airline._id || "N/A"
              );
            }
            return "N/A";
          })(),
        })),
        ...results.location.map((log) => ({
          ...log,
          type: "Location",
          adminEmail: log.adminId?.email || "N/A",
          entityName: (() => {
            if (log.location?.name) {
              return log.location.name;
            }
            if (typeof log.location === "object" && log.location !== null) {
              return (
                log.location.name ||
                log.location.code ||
                log.location._id ||
                "N/A"
              );
            }
            return "N/A";
          })(),
        })),
        ...results.ticket.map((log) => ({
          ...log,
          type: "Ticket",
          adminEmail: log.adminId?.email || "N/A",
          entityName: (() => {
            if (log.ticket?.PNR) {
              return log.ticket.PNR;
            }
            if (typeof log.ticket === "object" && log.ticket !== null) {
              return log.ticket.PNR || log.ticket._id || "N/A";
            }
            return "N/A";
          })(),
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt) -
          new Date(a.createdAt || a.updatedAt)
      );

      setBookingRequestAuditLogs(results.bookingRequest || []);
      setSearchHistoryLogs(results.searchHistory || []);
      setPassengerNameEditAuditLogs(results.passengerNameEdit || []);
      setAllAuditLogs(combinedAuditLogs);
      setError(null);
    } catch (err) {
      console.error("Error fetching audit data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  useEffect(() => {
    if (!selectedDropdownValue) {
      setAuditData(allAuditLogs);
    } else if (selectedDropdownValue === "bookingRequest") {
      setAuditData(bookingRequestAuditLogs);
    } else if (selectedDropdownValue === "searchHistory") {
      setAuditData(searchHistoryLogs || []);
    } else if (selectedDropdownValue === "passengerNameEdit") {
      setAuditData(passengerNameEditAuditLogs);
    } else {
      const filteredData = allAuditLogs.filter((log) => {
        switch (selectedDropdownValue) {
          case "admin":
            return log.type === "Admin";
          case "airline":
            return log.type === "Airline";
          case "location":
            return log.type === "Location";
          case "ticket":
            return log.type === "Ticket";
          default:
            return true;
        }
      });
      setAuditData(filteredData);
    }
  }, [
    selectedDropdownValue,
    allAuditLogs,
    bookingRequestAuditLogs,
    searchHistoryLogs,
    passengerNameEditAuditLogs,
  ]);

  if (loading) {
    return <div className="text-center p-6">Loading audit logs...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

 

  return (
    <>
      <div className="p-6 min-h-screen">
        <AGTable
          data={auditData}
          columns={
            selectedDropdownValue === "bookingRequest"
              ? BOOKING_REQUEST_AUDITLOG_COLUMNS
              : selectedDropdownValue === "searchHistory"
              ? SEARCH_HISTORY_COLUMNS
              : selectedDropdownValue === "passengerNameEdit"
              ? PASSENGER_NAME_EDIT_AUDITLOG_COLUMNS
              : ALL_AUDITLOG_COLUMNS
          }
          title="Audit Logs -"
          isTitleDropdown={true}
          titledropdwondata={{
            admin: "Admin",
            ticket: "Ticket",
            airline: "Airline",
            location: "Location",
            bookingRequest: "Booking Request",
            searchHistory: "Search History",
            passengerNameEdit: "Passenger Name Edit",
          }}
          selectedDropdownValue={selectedDropdownValue}
          onDropdownChange={handleDropdownChange}
          tableContext={
            selectedDropdownValue === "searchHistory"
              ? TABLE_CONTEXTS.SEARCH_HISTORY
              : selectedDropdownValue === "passengerNameEdit"
              ? TABLE_CONTEXTS.PASSENGER_NAME_EDIT_AUDIT_LOG
              : TABLE_CONTEXTS.AUDIT_LOG
          }
          adminRole={{ role: "admin" }}
        />
      </div>
    </>
  );
}
