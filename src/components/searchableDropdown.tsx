import React, { useState, useRef, useEffect } from "react";
import "@/styles/forms.css";

interface Option {
    id: string | number;
    label: string;
    value?: any;
    [key: string]: any; // Allow additional properties
}

interface SearchableDropdownProps {
    options: Option[];
    value: string;
    onChange: (selected: Option | null, customValue?: string) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    error?: string;
    allowCustom?: boolean; // Allow typing custom values not in list
    noResultsText?: string;
    customOptionText?: (searchTerm: string) => string;
    renderOption?: (option: Option) => React.ReactNode;
    filterFn?: (option: Option, searchTerm: string) => boolean;
}

export default function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "Search or select...",
    disabled = false,
    loading = false,
    className = "",
    error = "",
    allowCustom = false,
    noResultsText = "No options found",
    customOptionText = (term) => `Add "${term}" as new`,
    renderOption,
    filterFn
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [displayValue, setDisplayValue] = useState(value);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update display value when value prop changes
    useEffect(() => {
        setDisplayValue(value);
        setSearchTerm("");
    }, [value]);

    // Default filter function
    const defaultFilter = (option: Option, term: string) => {
        return option.label.toLowerCase().includes(term.toLowerCase());
    };

    // Filter options based on search term
    const filteredOptions = searchTerm
        ? options.filter(option =>
            filterFn ? filterFn(option, searchTerm) : defaultFilter(option, searchTerm)
        )
        : options;

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setDisplayValue(newValue);
        setIsOpen(true);

        if (allowCustom) {
            // Check for exact match
            const exactMatch = options.find(option =>
                option.label.toLowerCase() === newValue.toLowerCase()
            );

            if (exactMatch) {
                onChange(exactMatch);
            }
            // Don't call onChange for partial custom values while typing
            // Only when user explicitly selects the custom option or blurs
        }
    };

    // Handle option selection
    const handleOptionSelect = (option: Option) => {
        setDisplayValue(option.label);
        setSearchTerm("");
        setIsOpen(false);
        onChange(option);
        inputRef.current?.blur();
    };

    // Handle custom option selection (when allowCustom is true)
    const handleCustomSelect = () => {
        setDisplayValue(searchTerm);
        setIsOpen(false);
        onChange(null, searchTerm);
        inputRef.current?.blur();
    };

    // Handle input focus
    const handleFocus = () => {
        if (!disabled && !loading) {
            setIsOpen(true);
            if (displayValue) {
                setSearchTerm(displayValue);
            }
        }
    };

    // Handle input blur
    const handleBlur = () => {
        setTimeout(() => {
            setIsOpen(false);
            if (allowCustom && searchTerm) {
                // If user typed something custom and left the field, save it
                const exactMatch = options.find(option =>
                    option.label.toLowerCase() === searchTerm.toLowerCase()
                );
                if (!exactMatch) {
                    onChange(null, searchTerm);
                }
            } else if (!allowCustom) {
                // Reset to previous value if not allowing custom
                setSearchTerm("");
            }
        }, 200);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Default option renderer
    const defaultRenderOption = (option: Option) => (
        <span>{option.label}</span>
    );

    return (
        <div className="searchable-dropdown-wrapper" ref={dropdownRef}>
            <div className="searchable-dropdown">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchTerm : displayValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={loading ? "Loading..." : placeholder}
                    disabled={disabled || loading}
                    className={`${className} ${error ? "invalid-input" : ""}`}
                    autoComplete="off"
                />

                {isOpen && !disabled && !loading && (
                    <div className="dropdown-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="dropdown-item"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                                </div>
                            ))
                        ) : searchTerm ? (
                            allowCustom ? (
                                <div
                                    className="dropdown-item custom-option"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleCustomSelect}
                                >
                                    <i className="ri-add-line" style={{ marginRight: '8px' }} />
                                    {customOptionText(searchTerm)}
                                </div>
                            ) : (
                                <div className="dropdown-item disabled">
                                    {noResultsText}
                                </div>
                            )
                        ) : (
                            <div className="dropdown-item disabled">
                                {noResultsText}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="error-message">{error}</p>
        </div>
    );
}