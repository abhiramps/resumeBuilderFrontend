import React, { forwardRef } from "react";

/**
 * Button variant types
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Button size types
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button component props interface
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Icon to display on the left side of the button */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the button */
  rightIcon?: React.ReactNode;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Reusable Button component with variants, sizes, and loading states
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="md"
 *   loading={isLoading}
 *   onClick={handleClick}
 *   leftIcon={<SaveIcon />}
 * >
 *   Save Resume
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-md
      focus:outline-none focus:ring-2 focus:ring-offset-2
      transition-colors duration-200
      ${fullWidth ? "w-full" : ""}
    `;

    // Variant styles
    const variantStyles = {
      primary: `
        bg-primary text-white
        hover:bg-primary/90 active:bg-primary/80
        focus:ring-primary
        disabled:bg-gray-300 disabled:text-gray-500
      `,
      secondary: `
        bg-gray-100 text-gray-700 border border-gray-300
        hover:bg-gray-200 active:bg-gray-300
        focus:ring-gray-500
        disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100 active:bg-gray-200
        focus:ring-gray-500
        disabled:text-gray-400
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700 active:bg-red-800
        focus:ring-red-500
        disabled:bg-gray-300 disabled:text-gray-500
      `,
    };

    // Size styles
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className={`${loading ? "opacity-0" : ""} flex items-center`}>{children}</span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
