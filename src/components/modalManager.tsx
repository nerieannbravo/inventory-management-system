import React from "react";
import Modal from "@/components/modal";

interface ModalManagerProps {
	isOpen: boolean;
	onClose: () => void;
	modalContent: React.ReactNode;
}

export default function ModalManager({
	isOpen,
	onClose,
	modalContent,
}: ModalManagerProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			{modalContent}
		</Modal>
	);
}