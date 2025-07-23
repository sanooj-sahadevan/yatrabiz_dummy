"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import AGGrid from "@/components/admin/table/AGGrid";
import { PASSENGER_COLUMNS } from "@/constants/tableColumns";
import { Modal } from "@/components/common/Modal";
import { useEffect as useEffectReact } from "react";
import { TopbarTitleContext } from "@/app/admin/layout";

async function getBookingById(id) {
  const res = await fetch(`/api/v1/bookings?id=${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}

export default function BookingDetailsPage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editValues, setEditValues] = useState({
    honorific: "",
    firstName: "",
    lastName: "",
    remarks: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const { setCustomTitle } = useContext(TopbarTitleContext);

  useEffectReact(() => {
    setCustomTitle && setCustomTitle("Passenger List");
    return () => setCustomTitle && setCustomTitle(null);
  }, [setCustomTitle]);

  useEffectReact(() => {
    let isMounted = true;
    if (typeof params?.then === "function") {
      params.then((resolved) => {
        if (isMounted) setId(resolved.id);
      });
    } else {
      setId(params.id);
    }
    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffectReact(() => {
    if (!id) return;
    let stateBooking = null;
    if (window.history.state && window.history.state.usr) {
      stateBooking = window.history.state.usr;
    }
    if (stateBooking) {
      setBooking(stateBooking);
      setLoading(false);
    } else {
      getBookingById(id)
        .then((data) => {
          setBooking(data);
          setLoading(false);
        })
        .catch(() => {
          setBooking(null);
          setError("Failed to load booking details.");
          setLoading(false);
        });
    }
  }, [id]);

  const handleEditClick = (formData) => {
    const idx = booking.passengers.findIndex(
      (p) => p._id === formData.get("id")
    );
    if (idx !== -1) {
      const passenger = booking.passengers[idx];
      setEditIdx(idx);
      setEditValues({
        honorific: passenger.honorific || "",
        firstName: passenger.firstName || "",
        lastName: passenger.lastName || "",
        remarks: passenger.nameEditRemarks || "",
      });
      setEditError("");
    }
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          passengerIndex: editIdx,
          honorific: editValues.honorific,
          firstName: editValues.firstName,
          lastName: editValues.lastName,
          nameEditRemarks: editValues.remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(
          data.error || data.message || "Failed to update passenger"
        );

      const updated = [...booking.passengers];
      updated[editIdx] = data.passenger;
      setBooking({ ...booking, passengers: updated });
      setEditIdx(null);
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (!id) {
    return <div className="p-6 text-gray-600">Loading booking details...</div>;
  }
  if (loading) {
    return <div className="p-6 text-gray-600">Loading booking details...</div>;
  }
  if (error || !booking) {
    return (
      <div className="p-6 text-red-600">{error || "Booking not found."}</div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <button
        className="flex items-center -mt-6 mb-4 -ml-4 text-white text-base font-medium focus:outline-none"
        onClick={() => router.back()}
        type="button"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <span className="mr-2" style={{ fontSize: "1.2em", lineHeight: 1 }}>
          &larr;
        </span>
        Back
      </button>
      <AGGrid
        data={booking.passengers}
        columns={PASSENGER_COLUMNS}
        title="Passengers"
        tableContext="passengerList"
        adminRole={{ role: "super_admin" }}
        onEditClick={handleEditClick}
      />
      {/* Edit Name Modal */}
      {editIdx !== null && (
        <Modal
          isOpen={true}
          onClose={() => setEditIdx(null)}
          title={<span style={{ color: "#fff" }}>Edit Passenger Name</span>}
        >
          <div className="space-y-3 p-4" style={{ color: "#fff" }}>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: "#fff" }}
              >
                Honorific
              </label>
              <input
                className="w-full rounded p-2 border"
                style={{
                  color: "#000",
                  borderColor: "#d1d5db",
                  background: "#e5e7eb",
                }}
                value={editValues.honorific}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, honorific: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: "#fff" }}
              >
                First Name
              </label>
              <input
                className="w-full rounded p-2 border"
                style={{
                  color: "#000",
                  borderColor: "#d1d5db",
                  background: "#e5e7eb",
                }}
                value={editValues.firstName}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: "#fff" }}
              >
                Last Name
              </label>
              <input
                className="w-full rounded p-2 border"
                style={{
                  color: "#000",
                  borderColor: "#d1d5db",
                  background: "#e5e7eb",
                }}
                value={editValues.lastName}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, lastName: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: "#fff" }}
              >
                Remarks <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className="w-full rounded p-2 border"
                style={{
                  color: "#000",
                  borderColor: "#d1d5db",
                  background: "#e5e7eb",
                }}
                value={editValues.remarks}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, remarks: e.target.value }))
                }
                required
              />
            </div>
            {editError && (
              <div className="text-red-400 text-sm">{editError}</div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-2 bg-gray-700 rounded"
                style={{ color: "#fff", borderColor: "#fff" }}
                onClick={() => setEditIdx(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                style={{ borderColor: "#fff" }}
                onClick={async () => {
                  if (!editValues.remarks.trim()) {
                    setEditError("Remarks is required.");
                    return;
                  }
                  await handleEditSave();
                }}
                type="button"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
