import React, { useState } from "react";

import "@/styles/pagination.css";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems?: number; // Prop to track total items
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

const PaginationComponent: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems = 0, // Default to 0 if not provided
    onPageChange,
    onPageSizeChange,
}) => {
    const [jumpToPage, setJumpToPage] = useState<number | string>(''); // State for "Go to" input

    // Check if there's any data
    const hasData = totalItems > 0;

    // Calculate the range of page numbers to display
    const getPageNumbers = () => {
        const maxVisiblePages = 3; // Limit the number of visible page numbers
        const pages = [];

        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const handleJumpToPage = () => {
        const page = Number(jumpToPage);
        if (page >= 1 && page <= totalPages && hasData) {
            onPageChange(page);
        }
        setJumpToPage(''); // Clear the input after jumping
    };

    return (
        <div className="pagination-container">
            {/* Page Size Dropdown */}
            <div className="pagination-dropdown-container">
                <select
                    value={pageSize}
                    id="recordsPerPage"
                    className="pagination-dropdown"
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {[10, 20, 30, 50].map((size) => (
                        <option key={size} value={size}>
                            {size} /page
                        </option>
                    ))}
                </select>
            </div>

            {/* ========Previous Button======= */}
            <div className="pagination-button-container">
                <button
                    className="pagination-button-prevnext"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || !hasData} // Disable if no data
                >
                    <i className="ri-arrow-left-s-line"></i>
                </button>

                {/* ========First Page========= */}
                <button
                    className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                    onClick={() => onPageChange(1)}
                    disabled={!hasData} // Disable if no data
                >
                    1
                </button>

                {/* Ellipsis Before Visible Pages */}
                {hasData && pageNumbers[0] > 2 && <span className="pagination-ellipsis">...</span>}

                {/* Visible Page Numbers */}
                {hasData && pageNumbers.map((page) =>
                    page !== 1 && page !== totalPages ? (
                        <button
                            key={page}
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ) : null
                )}

                {/* Ellipsis After Visible Pages */}
                {hasData && totalPages > pageNumbers[pageNumbers.length - 1] + 1 && (
                    <span className="pagination-ellipsis">...</span>
                )}

                {/* Last Page */}
                {hasData && totalPages > 1 && (
                    <button
                        className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                        onClick={() => onPageChange(totalPages)}
                    >
                        {totalPages}
                    </button>
                )}

                {/* =========Next Button========== */}
                <button
                    className="pagination-button-prevnext"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || !hasData} // Disable if no data
                >
                    <i className="ri-arrow-right-s-line"></i>
                </button>
            </div>

            {/* =======Go To Input====== */}
            <div className="pagination-goto-container">
                <label className="pagination-go-to">
                    Go to:
                    <input
                        type="number"
                        min={1}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        placeholder="Page #"
                        className="pagination-input"
                    />
                </label>
                <button className="pagination-go-button" onClick={handleJumpToPage}> Go </button>
            </div>
        </div>
    );
};

export default PaginationComponent;