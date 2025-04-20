import ReactDOM from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <i className="ri-close-line"></i>
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}
