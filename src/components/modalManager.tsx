import React from "react";
import Modal from "@/components/modal";
import AddStockModal from "../app/(pages)/(stocks)/consumables/addStockModal";
import ViewStockModal from "../app/(pages)/(stocks)/consumables/viewStockModal";
import EditStockModal from "../app/(pages)/(stocks)/consumables/editStockModal";
import DeleteStockModal from "../app/(pages)/(stocks)/consumables/deleteStockModal";

interface ModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "add" | "view" | "edit" | "delete" | null;
  activeRow: any;
  formatStatus: (status: string) => string;
  onSaveAdd: (stockForms: any[]) => void;
  onSaveEdit: (updatedItem: any) => void;
  onDeleteConfirm: () => void;
}

export default function ModalManager({
  isOpen,
  onClose,
  modalMode,
  activeRow,
  formatStatus,
  onSaveAdd,
  onSaveEdit,
  onDeleteConfirm,
}: ModalManagerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {modalMode === "add" && (
        <AddStockModal onSave={onSaveAdd} onClose={onClose} />
      )}

      {modalMode === "view" && activeRow && (
        <ViewStockModal 
          item={activeRow} 
          formatStatus={formatStatus} 
          onClose={onClose} // Pass the onClose prop
        />
      )}

      {modalMode === "edit" && activeRow && (
        <EditStockModal item={activeRow} onSave={onSaveEdit} onClose={onClose} />
      )}

      {modalMode === "delete" && activeRow && (
        <DeleteStockModal
          item={activeRow}
          onConfirm={onDeleteConfirm}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}