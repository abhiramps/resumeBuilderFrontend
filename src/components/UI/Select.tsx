import React, { forwardRef, useState, useRef, useEffect } from "react";

/**
 * Select option interface
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select component props interface
 */
export interface SelectProps {
  /** Label text for the select */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the select */
  helperText?: string;
  /** Array of options */
  options: SelectOption[];
  /** Selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the select is required */
  required?: boolean;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Custom class name for the select */
  className?: string;
  /** Custom class name for the container */
  containerClassName?: string;
  /** Whether the select is searchable */
  searchable?: boolean;
}

/**
 * Reusable Select component with dropdown, keyboard navigation, and search
 *
 * @example
 * ```tsx
 * <Select
 *   label="Template"
 *   options={templateOptions}
 *   value={selectedTemplate}
 *   onChange={setSelectedTemplate}
 *   placeholder="Choose a template..."
 * />
 * ```
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      value,
      onChange,
      placeholder = "Select an option...",
      required,
      disabled = false,
      className = "",
      containerClassName = "",
      searchable = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const hasError = !!error;

    // Filter options based on search term
    const filteredOptions = searchable
      ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : options;

    // Get selected option
    const selectedOption = options.find((option) => option.value === value);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
          if (searchable && searchRef.current) {
            searchRef.current.focus();
          }
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[focusedIndex].value);
          }
          break;
      }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setFocusedIndex(-1);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && "current" in ref && ref.current) {
          if (!ref.current.contains(event.target as Node)) {
            setIsOpen(false);
            setSearchTerm("");
            setFocusedIndex(-1);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    // Scroll focused option into view
    useEffect(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const focusedElement = listRef.current.children[
          focusedIndex
        ] as HTMLElement;
        if (focusedElement) {
          focusedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }, [focusedIndex]);

    return (
      <div ref={ref} className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center text-xs font-medium text-gray-700"
          >
            <span>{label}</span>
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            ref={buttonRef}
            id={selectId}
            type="button"
            className={`
              relative w-full px-2 py-1.5 text-sm text-left border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
              ${hasError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary focus:border-primary"
              }
              ${disabled
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-900 cursor-pointer"
              }
              ${className}
            `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
          >
            <span
              className={`block truncate ${selectedOption ? "text-gray-900" : "text-gray-500"}`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                  }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    ref={searchRef}
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              )}

              <ul
                ref={listRef}
                className="max-h-60 overflow-auto py-1"
                role="listbox"
                aria-label={label}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      className={`
                        px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                        ${index === focusedIndex
                          ? "bg-primary text-white"
                          : "text-gray-900 hover:bg-gray-100"
                        }
                        ${option.disabled ? "opacity-50 cursor-not-allowed" : ""
                        }
                      `}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      role="option"
                      aria-selected={option.value === value}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
