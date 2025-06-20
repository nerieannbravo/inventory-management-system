"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";

import AddBusModal, { BusForm } from "./addBusModal";
import ViewBusModal from "./viewBusModal";
import EditBusModal from "./editBusModal";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css"

export default function BusManagement() {
  const [busData, setBusData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [activeRow, setActiveRow] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchBuses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/bus");
      const result = await res.json();
      if (result.success) {
        setBusData(result.buses);
      } else {
        console.error("Fetch error:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Enhanced filter and search logic using useMemo
  const filteredAndSearchedBuses = useMemo(() => {
    let filtered = [...busData];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(bus =>
        (bus.plate_number?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (bus.body_number?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (bus.body_builder?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (bus.bus_type?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (bus.status?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (bus.seat_capacity?.toString() ?? "").includes(searchTerm) ||
        (bus.condition?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      );
    }

    // Apply body builder filter
    if (filterValues.bodyBuilder?.length) {
      filtered = filtered.filter(bus =>
        filterValues.bodyBuilder.includes(bus.body_builder.toLowerCase())
      );
    }

    // Apply status filter
    if (filterValues.busStatus?.length) {
      filtered = filtered.filter(bus =>
        filterValues.busStatus.includes(bus.status.toLowerCase())
      );
    }

    // Apply bus type filter
    if (filterValues.busType?.length) {
      filtered = filtered.filter(bus =>
        filterValues.busType.includes(bus.bus_type.toLowerCase())
      );
    }

    // Apply sorting
    const order = filterValues.order || "asc";
    filtered.sort((a, b) => {
      // Default sort by body number
      const aValue = a.body_number?.toLowerCase() || "";
      const bValue = b.body_number?.toLowerCase() || "";
      
      const comparison = aValue.localeCompare(bValue);
      return order === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [busData, searchTerm, filterValues]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSearchedBuses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBuses = filteredAndSearchedBuses.slice(startIndex, startIndex + pageSize);

  const filterSections: FilterSection[] = [
    {
      id: "bodyBuilder",
      title: "Body Builder",
      type: "checkbox",
      options: [
        { id: "agila", label: "Agila" },
        { id: "hilltop", label: "Hilltop" },
        { id: "rbm", label: "RBM" },
        { id: "darj", label: "DARJ" }
      ]
    },
    {
      id: "busStatus",
      title: "Status",
      type: "checkbox",
      options: [
        { id: "active", label: "Active" },
        { id: "decommissioned", label: "Decommissioned" },
        { id: "under-maintenance", label: "Under Maintenance" }
      ]
    },
    {
      id: "busType",
      title: "Bus Type",
      type: "checkbox",
      options: [
        { id: "airconditioned", label: "Airconditioned" },
        { id: "ordinary", label: "Ordinary" }
      ]
    },
    {
      id: "order",
      title: "Order",
      type: "radio",
      options: [
        { id: "asc", label: "Ascending" },
        { id: "desc", label: "Descending" }
      ],
      defaultValue: "asc"
    }
  ];

  // Handle filter application
  const handleApplyFilters = (newFilterValues: Record<string, any>) => {
    setFilterValues(newFilterValues);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      active: "Active",
      decommissioned: "Decommissioned",
      under_maintenance: "Under Maintenance"
    };
    return map[status] || status;
  };

    function formatCondition(condition: string) {
        switch (condition) {
            case "BRAND_NEW":
                return "Brand New";
            case "SECOND_HAND":
                return "Second Hand";
            default:
                return condition;
        }
    }

  const formatBodyBuilder = (builder?: string) => {
    if (!builder) return "Unknown";
    const upper = ["RBM", "DARJ"];
    return upper.includes(builder.toUpperCase())
      ? builder.toUpperCase()
      : builder.charAt(0).toUpperCase() + builder.slice(1).toLowerCase();
  };

  const formatBusType = (type?: string) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const openModal = (mode: "add-bus" | "view-bus" | "edit-bus", data?: any) => {
    let content: React.ReactNode;

    switch (mode) {
      case "add-bus":
        content = <AddBusModal onSave={handleAddBus} onClose={closeModal} />;
        break;
      case "view-bus":
        content = <ViewBusModal item={data} formatStatus={formatStatus} onClose={closeModal} />;
        break;
      case "edit-bus":
        content = <EditBusModal item={data} onSave={handleEditBus} onClose={closeModal} />;
        break;
    }

    setModalContent(content);
    setActiveRow(data || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setActiveRow(null);
  };

  const handleAddBus = async (busForm: BusForm) => {
    closeModal();
    setIsLoading(true);
    await fetchBuses();
  };

  const handleEditBus = async () => {
    closeModal();
    setIsLoading(true);
    await fetchBuses();
  };

  return (
    <div className="card">
      <h1 className="title">Bus Management</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="elements">
          <div className="entries">
            <div className="search">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="filter">
              <FilterDropdown sections={filterSections} onApply={handleApplyFilters} />
            </div>

            <button className="generate-btn">
              <i className="ri-receipt-line" /> Generate Report
            </button>

            <button className="main-btn" onClick={() => openModal("add-bus")}> 
              <i className="ri-add-line" /> Add Bus
            </button>
          </div>

          <div className="table-wrapper">
            <div className="table-container">
              <table className="data-table">
                <thead className="table-heading">
                  <tr>
                    <th>Body Number</th>
                    <th>Plate Number</th>
                    <th>Body Builder</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Bus Type</th>
                    <th>Seat Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {paginatedBuses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="no-records">
                        {searchTerm || Object.keys(filterValues).some(key =>
                          filterValues[key] &&
                          (Array.isArray(filterValues[key]) ? filterValues[key].length > 0 : true)
                        )
                          ? 'No buses matched'
                          : 'No buses available'
                        }
                      </td>
                    </tr>
                  ) : (
                    paginatedBuses.map(bus => (
                      <tr key={bus.bus_id}>
                        <td>{bus.body_number}</td>
                        <td>{bus.plate_number}</td>
                        <td>{formatBodyBuilder(bus.body_builder)}</td>
                        <td>{formatCondition(bus.condition)}</td>
                        <td className="table-status">
                          <span className={`chip ${bus.status?.toLowerCase() || "unknown"}`}>
                            {formatStatus(bus.status?.toLowerCase() || "unknown")}
                          </span>
                        </td>
                        <td>{formatBusType(bus.bus_type)}</td>
                        <td>{bus.seat_capacity}</td>
                        <td>
                          <ActionButtons
                            onView={() => openModal("view-bus", bus)}
                            onEdit={() => openModal("edit-bus", bus)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={paginatedBuses.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      <ModalManager isOpen={isModalOpen} onClose={closeModal} modalContent={modalContent} />
    </div>
  );
}