"use client";
import { useRef } from "react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useTableGrid } from "@/hooks/useTableGrid";
import TableHeader from "@/components/admin/tableHeader/TableHeader";
import { TABLE_CONFIG } from "@/constants/tableConstants";
import "@/styles/style.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const CustomTooltip = (props) => {
  const { value } = props;
  return (
    <div className="bg-slate-800/95 text-white px-[14px] py-2 rounded-lg text-sm shadow-lg max-w-[320px] break-words font-medium tracking-[0.1px]">
      {value}
    </div>
  );
};

export default function AGTable({
  data,
  columns,
  title = "Data Table",
  onAddClick,
  onEditClick,
  onDeleteClick,
  onPendingPaymentClick,
  adminRole,
  tableContext,
  actionLabels = { edit: "Edit", delete: "Delete" },
  loading = {},
  isTitleDropdown,
  titledropdwondata,
  selectedDropdownValue,
  onDropdownChange,
  onNonBookableClick,
  showNonBookableAction,
  frameworkComponents = {},
  context = {},
}) {
  const gridRef = useRef(null);
  const searchInputRef = useRef(null);

  const isSuperAdmin = adminRole?.role === "super_admin";

  const columnsWithTooltips = columns.map((col) => ({
    ...col,
    headerTooltip: col.tooltip || col.label,
  }));

  const gridContext = { ...context, onEditClick };

  const {
    agColumns,
    defaultColDef,
    onGridReady,
    onSearchChange,
    searchText,
    getRowStyle,
    getRowClass,
  } = useTableGrid({
    columns: columnsWithTooltips,
    adminRole,
    tableContext,
    onEditClick,
    onDeleteClick,
    onPendingPaymentClick,
    actionLabels,
    loading,
    onNonBookableClick,
    showNonBookableAction,
  });

  return (
    <div className="w-full">
      <TableHeader
        title={title}
        searchText={searchText}
        onSearchChange={onSearchChange}
        onAddClick={onAddClick}
        isSuperAdmin={isSuperAdmin}
        tableContext={tableContext}
        isTitleDropdown={isTitleDropdown}
        titledropdwondata={titledropdwondata}
        selectedDropdownValue={selectedDropdownValue}
        onDropdownChange={onDropdownChange}
        adminRole={adminRole}
        searchInputRef={searchInputRef}
      />

      <div
        className="ag-theme-alpine w-full"
        style={{
          height: TABLE_CONFIG.GRID_HEIGHT,
        }}
      >
       <AgGridReact
          ref={gridRef}
          onGridReady={onGridReady}
          rowData={data}
          columnDefs={agColumns}
          defaultColDef={{
            ...defaultColDef,
            tooltipComponent: CustomTooltip,
            tooltipShowDelay: 200,
            tooltipHideDelay: 100,
          }}
          pagination={true}
          paginationPageSize={TABLE_CONFIG.DEFAULT_PAGE_SIZE}
          paginationPageSizeSelector={[10, 20, 30, 40, 50]}
          animateRows={true}
          quickFilterText={searchText}
          getRowStyle={getRowStyle}
          getRowClass={getRowClass}
          suppressMenuHide={true}
          enableCellTextSelection={true}
          frameworkComponents={frameworkComponents}
          context={gridContext}
          getRowId={(params) =>
            params.data.id ||
            params.data._id ||
            params.data.PNR ||
            params.data.pnr ||
            (params.node ? params.node.rowIndex?.toString() : undefined) ||
            Math.random().toString()
          }
          getRowHeight={(params) => {
            const baseHeight = 48;
            if (params.data && Array.isArray(params.data.passengerList)) {
              return Math.max(
                baseHeight,
                params.data.passengerList.length * 24
              );
            }
            return baseHeight;
          }}
        />
      </div>
    </div>
  );
}
