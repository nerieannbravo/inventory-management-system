import React from "react";
import Modal from "@/components/modal";
import AddStockModal from "../app/(pages)/stocks/addStockModal";
import ViewStockModal from "../app/(pages)/stocks/viewStockModal";
import EditStockModal from "../app/(pages)/stocks/editStockModal";
import DeleteStockModal from "../app/(pages)/stocks/deleteStockModal";

// Import the StockForm interface
import { StockForm } from "../app/(pages)/stocks/addStockModal";

interface ModalManagerProps {
	isOpen: boolean;
	onClose: () => void;
	modalMode: "add" | "view" | "edit" | "delete" | null;
	activeRow: any;
	formatStatus: (status: string) => string;
	onSaveAdd: (stockForm: StockForm) => void;  // Changed from stockForms: any[] to stockForm: StockForm
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
					onClose={onClose}
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