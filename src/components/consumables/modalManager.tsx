import React from "react";
import Modal from "@/components/modal";
import AddStockModal from "./addStockModal";
import ViewStockModal from "./viewStockModal";
import EditStockModal from "./editStockModal";
import DeleteStockModal from "./deleteStockModal";

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
				<ViewStockModal item={activeRow} formatStatus={formatStatus} />
			)}

			{modalMode === "edit" && activeRow && (
				<EditStockModal item={activeRow} onSave={onSaveEdit} />
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