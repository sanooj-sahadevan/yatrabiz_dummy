"use client";

import { useState } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import Table from "@/components/admin/table/AGGrid";
import AddAirlineModal from "@/components/admin/modals/AddAirlineModal";
import EditAirlineModal from "@/components/admin/modals/EditAirlineModal";
import { useAirlines } from "@/hooks/useAirlines";
import { toast } from "react-toastify";

export default function AirlinesListClient({
  airlines: initialAirlines,
  columns,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editAirline, setEditAirline] = useState(null);

  const { admin: currentAdmin, error: adminError } = useAdminSession();

  const {
    data: airlines,
    error: airlinesError,
    refetch,
    deleteData,
  } = useAirlines(initialAirlines);

  const handleSuccess = () => {
    setShowModal(false);
    setEditAirline(null);
    refetch();
  };

  const handleEditClick = (formData) => {
    const airlineId = formData.get("id");
    const airlineToEdit = airlines.find((a) => a._id === airlineId);
    if (airlineToEdit) setEditAirline(airlineToEdit);
  };

  const handleDeleteClick = async (formData) => {
    const airlineId = formData.get("id");
    const airlineToDelete = airlines.find((a) => a._id === airlineId);
    if (!airlineToDelete || !confirm(`Delete ${airlineToDelete.name}?`)) return;

    try {
      await deleteData(airlineId, currentAdmin?.id);
      toast.success("Airline deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete airline");
      console.error(err);
    }
  };

  const error = airlinesError || adminError;

  return (
    <>
      {error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <>
          <Table
            data={airlines}
            title="Airlines"
            columns={columns}
            onAddClick={() => setShowModal(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            adminRole={currentAdmin}
            tableContext="airlines"
          />
          {showModal && (
            <AddAirlineModal
              currentAdmin={currentAdmin}
              onClose={() => setShowModal(false)}
              onSuccess={() => {
                toast.success("Airline added successfully");
                handleSuccess();
              }}
            />
          )}
          {editAirline && (
            <EditAirlineModal
              currentAdmin={currentAdmin}
              airline={editAirline}
              onClose={() => setEditAirline(null)}
              onSuccess={() => {
                toast.success("Airline updated successfully");
                handleSuccess();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
