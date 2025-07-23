import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import {
  COMPANY_INFO,
  TERMS_AND_CONDITIONS,
  IMPORTANT_INFORMATION,
  PDF_LABELS,
  PDF_IMPORTANT_NOTES,
} from "../../constants/pdfConstants";
import { styles } from "../../styles/bookingDetailsStyles";
import { formatDate } from "./utils/pdfUtils";
import { calculateTravelDuration } from "@/utils/formatters";

const InfoIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke="#f59e42"
      strokeWidth="2"
      fill="none"
    />
    <Path stroke="#f59e42" strokeWidth="2" d="M12 8v4M12 16h.01" />
  </Svg>
);

const BookingDetailsPDF = ({ booking }) => {
  const ticketDetails = booking.ticket || {};
  const flightInfo = {
    departure: ticketDetails.departureLocation?.name || "",
    arrival: ticketDetails.arrivalLocation?.name || "",
    departureTime: ticketDetails.departureTime || "",
    arrivalTime: ticketDetails.arrivalTime || "",
  };
  const airline = ticketDetails.airline || {};
  const airlineName =
    typeof airline === "object" ? airline.name || "" : airline || "";
  const headerImageBase64 =
    typeof airline === "object" ? airline.headerImageBase64 : undefined;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {headerImageBase64 ? (
          <View style={{ width: "100%", height: 60, marginBottom: 18 }}>
            <Image
              src={headerImageBase64}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        ) : (
          <View style={styles.headerContainer}>
            <Text style={styles.companyName}>{airlineName}</Text>
            <Text style={styles.tagline}>{COMPANY_INFO.tagline}</Text>
          </View>
        )}

        <View
          style={{
            marginBottom: 4,
            paddingVertical: 0,
            paddingHorizontal: 0,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#444",
              paddingVertical: 6,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 1,
                flex: 1,
              }}
            >
              {(PDF_LABELS && PDF_LABELS.passengerDetails) ||
                "PASSENGER DETAILS"}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              {booking.passengers?.length || 0} PASSENGER
              {booking.passengers && booking.passengers.length > 1 ? "S" : ""}
            </Text>
          </View>
          <View style={{ padding: 2, paddingTop: 2 }}>
            {(booking.passengers || []).map((passenger, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#000",
                    lineHeight: 1.5,
                    flex: 1,
                  }}
                >
                  {idx + 1}.{" "}
                  {[
                    passenger.honorific,
                    passenger.firstName,
                    passenger.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{ height: 1, backgroundColor: "#000", marginVertical: 2 }}
        />

        <View
          style={{
            marginBottom: 8,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#444",
              paddingVertical: 6,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 1,
              }}
            >
              {(PDF_LABELS && PDF_LABELS.flightDetails) || "FLIGHT DETAILS"}
            </Text>
          </View>
          <View style={{ padding: 2, paddingTop: 2 }}>
            {/* Top Row: Cities, Arrow, Date */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <Text
                style={{
                  fontWeight: "normal",
                  fontSize: 13,
                  color: "#0a2342",
                  marginRight: 6,
                  minWidth: 60,
                  lineHeight: 1.2,
                  verticalAlign: "middle",
                }}
              >
                {flightInfo.departure}
              </Text>
              <Svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                style={{
                  marginRight: 18,
                  alignSelf: "center",
                  transform: "rotate(90deg)",
                }}
              >
                <Path
                  d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V21l2-1 2 1V13.5z"
                  stroke="black"
                  strokeWidth="1.5"
                  fill="none"
                />
              </Svg>
              <Text
                style={{
                  fontWeight: "normal", // Not bold
                  fontSize: 13,
                  color: "#0a2342", // Dark navy blue
                  marginRight: 10,
                  minWidth: 60,
                  lineHeight: 1.2,
                  verticalAlign: "middle",
                }}
              >
                {flightInfo.arrival}
              </Text>

              <Text
                style={{
                  fontSize: 9,
                  color: "#888",
                  minWidth: 70,
                  paddingTop: 6,
                }}
              >
                {formatDate(ticketDetails.dateOfJourney)}
              </Text>
            </View>
            {/* Bottom Row: Details Grid */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {/* Airline logo and name */}
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: 80,
                  maxWidth: 110,
                  marginRight: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{ fontWeight: 700, fontSize: 11, color: "#222" }}
                  >
                    {typeof ticketDetails.airline === "object"
                      ? ticketDetails.airline?.name || ""
                      : ticketDetails.airline || ""}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {ticketDetails.flightNumber || ""}
                </Text>
              </View>
              {/* Departure time/code */}
              <View
                style={{ alignItems: "center", minWidth: 55, marginRight: 8 }}
              >
                <Text style={{ fontWeight: 700, fontSize: 12 }}>
                  {flightInfo.departureTime}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {ticketDetails.departureLocation?.code &&
                  ticketDetails.departureLocation?.name
                    ? `${ticketDetails.departureLocation.code} (${ticketDetails.departureLocation.name})`
                    : ticketDetails.departureLocation?.code ||
                      ticketDetails.departureLocation?.name ||
                      ""}
                </Text>
              </View>
              {/* Duration */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minWidth: 60,
                  marginRight: 8,
                }}
              >
                <Svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  style={{ marginRight: 2 }}
                >
                  <Path fill="#888" d="M12 8v5l3 3" />
                  <Circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#888"
                    strokeWidth="2"
                    fill="none"
                  />
                </Svg>
                <Text style={{ fontSize: 10, color: "#666" }}>
                  {calculateTravelDuration(
                    ticketDetails.dateOfJourney,
                    ticketDetails.departureTime,
                    ticketDetails.arrivalTime
                  )}
                </Text>
              </View>
              {/* Arrival time/code */}
              <View
                style={{ alignItems: "center", minWidth: 55, marginRight: 8 }}
              >
                <Text style={{ fontWeight: 700, fontSize: 12 }}>
                  {flightInfo.arrivalTime}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {ticketDetails.arrivalLocation?.code &&
                  ticketDetails.arrivalLocation?.name
                    ? `${ticketDetails.arrivalLocation.code} (${ticketDetails.arrivalLocation.name})`
                    : ticketDetails.arrivalLocation?.code ||
                      ticketDetails.arrivalLocation?.name ||
                      ""}
                </Text>
              </View>
              {/* PNR and class */}
              <View
                style={{ alignItems: "center", minWidth: 60, marginRight: 8 }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#888",
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  Airline PNR
                </Text>
                <Text
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#fff",
                    backgroundColor: "#444",
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    borderRadius: 7,
                    marginVertical: 2,
                    letterSpacing: 2,
                    textAlign: "center",
                  }}
                >
                  {ticketDetails.PNR || ""}
                </Text>
                <Text style={{ fontSize: 9, color: "#888" }}>
                  {ticketDetails.classType || "Economy"}
                </Text>
              </View>
              {/* Baggage */}
              <View
                style={{ alignItems: "center", minWidth: 45, marginRight: 8 }}
              >
                <Text style={{ fontSize: 9, color: "#888", paddingTop: 2 }}>
                  {(PDF_LABELS && PDF_LABELS.baggage) || "Baggage"}
                </Text>
                <Text style={{ fontWeight: 700, fontSize: 11, color: "#222" }}>
                  {ticketDetails.baggage || "15 KG"}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: "#888",
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {ticketDetails.meal ||
                    (PDF_LABELS && PDF_LABELS.meals) ||
                    "Meals: At Extra Cost"}
                </Text>
              </View>
              {/* Meal */}
            </View>
          </View>
        </View>

        {/* Fare Details Table */}
        {booking.updatedPrice && (
          <View
            style={{
              marginBottom: 8, // reduced from 12
              padding: 8, // reduced from 14
              backgroundColor: "#fff", // white background
              border: "1px solid #000", // black border
              // No borderRadius for sharp corners
            }}
          >
            <Text
              style={{
                fontWeight: 700,
                fontSize: 12,
                color: "#222",
                marginBottom: 4, // reduced from 8
                letterSpacing: 1,
              }}
            >
              Fare Details
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 2, // reduced from 4
              }}
            >
              <Text style={{ fontSize: 11, color: "#444" }}>Ticket Fare</Text>
              <Text style={{ fontSize: 11, color: "#222", fontWeight: 700 }}>
                Rs.{" "}
                {(() => {
                  const passengers = booking.passengers || [];

                  const infantCount = passengers.filter(
                    (p) => p.type === "Infant"
                  ).length;
                  const nonInfantCount = passengers.length - infantCount;
                  const infantFee = booking.ticket?.infantFees || 0;

                  if (infantCount === 0 || !booking.ticket) {
                    // No infants or no ticket object, use original logic
                    return Math.floor(
                      booking.updatedPrice / (passengers.length || 1)
                    ).toLocaleString("en-IN");
                  } else {
                    // There are infants
                    const totalInfantFees = infantCount * infantFee;
                    const nonInfantFare =
                      nonInfantCount > 0
                        ? Math.floor(
                            (booking.updatedPrice - totalInfantFees) /
                              nonInfantCount
                          )
                        : 0;
                    // Show the non-infant fare if there are non-infants, otherwise show infant fare
                    return nonInfantCount > 0
                      ? `${nonInfantFare.toLocaleString(
                          "en-IN"
                        )} (Infant: Rs. ${infantFee.toLocaleString("en-IN")})`
                      : infantFee.toLocaleString("en-IN");
                  }
                })()}
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: "#000", // black line
                marginVertical: 2, // reduced from 4
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 2, // reduced from 4
              }}
            >
              <Text style={{ fontSize: 12, color: "#222", fontWeight: 700 }}>
                Total
              </Text>
              <Text style={{ fontSize: 12, color: "#222", fontWeight: 700 }}>
                Rs. {Math.floor(booking.updatedPrice).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        )}

        {/* Important Notes Box */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: "#fffbe6",
            padding: 14,
            marginBottom: 12,
          }}
        >
          <View style={{ marginRight: 10, marginTop: 2 }}>
            <InfoIcon />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 12,
                color: "#222",
                marginBottom: 4,
                textAlign: "left",
              }}
            >
              {(PDF_LABELS && PDF_LABELS.importantNotes) || "Important Notes"}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#222",
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              {PDF_IMPORTANT_NOTES || ""}
            </Text>
          </View>
        </View>

        {/* Divider between boxes */}
        <View
          style={{ height: 1, backgroundColor: "#000", marginVertical: 2 }}
        />

        {/* TERMS AND CONDITIONS */}
        <View
          style={{
            marginBottom: 12,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
              marginBottom: 6,
              color: "#444",
            }}
          >
            {(PDF_LABELS && PDF_LABELS.termsAndConditions) ||
              "TERMS AND CONDITIONS"}
          </Text>
          {(TERMS_AND_CONDITIONS || []).map((term, idx) => (
            <Text
              key={idx}
              style={{
                fontSize: 10,
                marginBottom: 2,
                color: "#222",
                lineHeight: 1.5,
              }}
            >
              {idx + 1}. {term}
            </Text>
          ))}
        </View>

        {/* Important Information */}
        <View
          style={{
            marginBottom: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              marginBottom: 2,
              color: "#222",
              lineHeight: 1.5,
            }}
          >
            {(PDF_LABELS && PDF_LABELS.importantInformation) ||
              "IMPORTANT INFORMATION"}
          </Text>
          {(IMPORTANT_INFORMATION || []).map((info, idx) => (
            <Text
              key={idx}
              style={{
                fontSize: 10,
                marginBottom: 2,
                color: "#222",
                lineHeight: 1.5,
              }}
            >
              {idx + 1}. {info}
            </Text>
          ))}
        </View>

        {/* Footer with divider */}
        <View
          style={{
            marginTop: 10,
            marginBottom: 4,
          }}
        />
        {/* <Text style={{ fontSize: 9, color: "#888", textAlign: "left" }} fixed>
          {((PDF_LABELS && PDF_LABELS.generatedBy) ? PDF_LABELS.generatedBy(COMPANY_INFO.name) : `Generated by ${COMPANY_INFO.name} on`)}{" "}
          {new Date().toLocaleDateString("en-IN")}
        </Text> */}
      </Page>
    </Document>
  );
};

export default BookingDetailsPDF;
