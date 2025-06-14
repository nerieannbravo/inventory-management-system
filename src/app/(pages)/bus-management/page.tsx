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

export default function BusManagement() {
  const [busData, setBusData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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
        setFilteredData(result.buses);
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

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

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

  const handleApplyFilters = (filters: Record<string, any>) => {
    let filtered = [...busData];

    if (filters.bodyBuilder?.length) {
      filtered = filtered.filter(bus =>
        filters.bodyBuilder.includes(bus.body_builder.toLowerCase())
      );
    }

    if (filters.busStatus?.length) {
      filtered = filtered.filter(bus =>
        filters.busStatus.includes(bus.status.toLowerCase())
      );
    }

    if (filters.busType?.length) {
      filtered = filtered.filter(bus =>
        filters.busType.includes(bus.bus_type.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = busData.filter(bus =>
      (bus.plate_number?.toLowerCase() ?? "").includes(term) ||
      (bus.body_number?.toLowerCase() ?? "").includes(term) ||
      (bus.body_builder?.toLowerCase() ?? "").includes(term) ||
      (bus.bus_type?.toLowerCase() ?? "").includes(term) ||
      (bus.status?.toLowerCase() ?? "").includes(term) ||
      (bus.seat_capacity?.toString() ?? "").includes(term)
    );

    setFilteredData(results);
    setCurrentPage(1);
  }, [searchTerm, busData]);

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      active: "Active",
      decommissioned: "Decommissioned",
      under_maintenance: "Under Maintenance"
    };
    return map[status] || status;
  };

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
        content = <ViewBusModal item={data} onClose={closeModal} />;
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

  const handleEditBus = async (busForm: BusForm) => {
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
                onChange={e => setSearchTerm(e.target.value)}
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
                    <th>Plate Number</th>
                    <th>Body Number</th>
                    <th>Body Builder</th>
                    <th>Bus Type</th>
                    <th>Status</th>
                    <th>Seat Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {paginatedData.map(bus => (
                    <tr key={bus.bus_id}>
                      <td>{bus.plate_number}</td>
                      <td>{bus.body_number}</td>
                      <td>{formatBodyBuilder(bus.body_builder)}</td>
                      <td>{formatBusType(bus.bus_type)}</td>
                      <td className="table-status">
                        <span className={`chip ${bus.status?.toLowerCase() || "unknown"}`}>
                          {formatStatus(bus.status?.toLowerCase() || "unknown")}
                        </span>
                      </td>
                      <td>{bus.seat_capacity}</td>
                      <td>
                        <ActionButtons
                          onView={() => openModal("view-bus", bus)}
                          onEdit={() => openModal("edit-bus", bus)}
                        />
                      </td>
                    </tr>
                  ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={size => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <ModalManager isOpen={isModalOpen} onClose={closeModal} modalContent={modalContent} />
    </div>
  );
}