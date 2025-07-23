"use client";

import { useState } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import Table from "@/components/admin/table/AGGrid";
import AddLocationModal from "@/components/admin/modals/AddLocationModal";
import EditLocationModal from "@/components/admin/modals/EditLocationModal";
import { useLocations } from "@/hooks/useLocations";

export default function LocationListClient({
  location: initialLocation,
  columns,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editLocation, setEditLocation] = useState(null);

  const {
    admin: currentAdmin,
    loading: adminLoading,
    error: adminError,
  } = useAdminSession();

  // const {
  //   data: locations,
  //   loading: locationsLoading,
  //   error: locationsError,
  //   refetch,
  //   deleteData,
  // } = useLocations(initialLocation);

  const {
  data: locations,
  loading: locationsLoading,
  error: locationsError,
  refetch,
  deleteData,
} = useLocations(initialLocation);

  const handleSuccess = () => {
    setShowModal(false);
    setEditLocation(null);
    refetch();
  };

  const handleEditClick = (formData) => {
    const locationId = formData.get("id");
    const locationToEdit = locations.find((l) => l._id === locationId);
    if (locationToEdit) setEditLocation(locationToEdit);
  };

  const handleDeleteClick = async (formData) => {
    const locationId = formData.get("id");
    const locationToDelete = locations.find((l) => l._id === locationId);
    if (!locationToDelete || !confirm(`Delete ${locationToDelete.name}?`))
      return;

    try {
      await deleteData(locationId, currentAdmin.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = locationsLoading || adminLoading;
  const error = locationsError || adminError;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <>
          <Table
            data={locations}
            title="Locations"
            columns={columns}
            onAddClick={() => setShowModal(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            adminRole={currentAdmin}
            tableContext="locations"
          />
          {showModal && (
            <AddLocationModal
              currentAdmin={currentAdmin}
              onClose={() => setShowModal(false)}
              onSuccess={handleSuccess}
            />
          )}
          {editLocation && (
            <EditLocationModal
              currentAdmin={currentAdmin}
              location={editLocation}
              onClose={() => setEditLocation(null)}
              onSuccess={handleSuccess}
            />
          )}
        </>
      )}
    </>
  );
}
