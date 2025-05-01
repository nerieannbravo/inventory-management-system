// components/Snackbar.tsx
import React, { useEffect } from "react";
import "@/styles/snackbar.css";

interface SnackbarProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    type?: "success" | "error" | "info" | "warning";
}

const Snackbar: React.FC<SnackbarProps> = ({
    message,
    isVisible,
    onClose,
    duration = 3000,
    type = "info"
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return <i className="snackbar-icon ri-checkbox-circle-line" />;
            case "error":
                return <i className="snackbar-icon ri-close-circle-line" />;
            case "warning":
                return <i className="snackbar-icon ri-error-warning-line" />;
            case "info":
            default:
                return <i className="snackbar-icon ri-information-2-line" />;
        }
    };

    return (
        <div className={`snackbar ${isVisible ? "show" : ""} ${type}`}>
            <span className="snackbar-icon">{getIcon()}</span>
            <span className="snackbar-message">{message}</span>
        </div>
    );
};

export default Snackbar;