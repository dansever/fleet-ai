import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';

const buttonStyles = cva(
  [
    'border border-transparent inline-flex items-center justify-center',
    'rounded-xl shadow-sm hover:shadow-md ',
    'transition-colors duration-200',
    'font-normal text-center',
    'cursor-pointer flex-shrink-0',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      intent: {
        // Primary action - main call-to-action, most important actions
        primary:
          'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white',
        // Secondary action - less prominent, alternative actions
        secondary:
          'bg-white border border-primary/20 text-gray-600 hover:text-gray-800 hover:border-primary/40',
        // Secondary inverted - for use on dark/colored backgrounds
        secondaryInverted: 'bg-white/30 hover:bg-white/40 text-white',
        // Add action - for creating new items, bright and inviting
        add: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
        // Success action - confirmations, completions, positive outcomes
        success:
          'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white',
        // Warning action - caution required, potentially risky actions
        warning:
          'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
        // Danger action - destructive actions, deletions, critical operations
        danger:
          'bg-gradient-to-r from-red-500 to-red-500 opacity-80 hover:from-red-600 hover:to-red-700 text-white',
        // Ghost action - minimal prominence, tertiary actions, icon buttons
        ghost: 'bg-transparent hover:bg-muted/80 text-primary/70 shadow-none hover:shadow-none',
      },
      size: {
        sm: 'h-8 p-2 rounded-lg text-sm',
        md: 'h-10 p-3 text-base',
        lg: 'h-12 p-4 text-lg',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonStyles>;
type ButtonIntent =
  | 'primary'
  | 'secondary'
  | 'secondaryInverted'
  | 'add'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';
type ButtonIconPosition = 'left' | 'right';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    ButtonStyleProps {
  intent?: ButtonIntent;
  size?: ButtonSize;
  type?: ButtonType;
  text?: string | null; // The text to display in the button
  icon?: LucideIcon; // Optional icon to display before the text
  iconPosition?: ButtonIconPosition; // Position of the icon relative to text
  isLoading?: boolean; // Show loading state
  loadingIcon?: LucideIcon; // Custom loading icon (defaults to Loader2, or RefreshCw if original icon is RefreshCw)
  href?: string; // Link to navigate to (renders as Link instead of button)
  external?: boolean; // Open link in new tab
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      intent,
      size,
      type = 'button',
      text = null,
      icon: Icon = null,
      iconPosition = 'left',
      isLoading = false,
      loadingIcon,
      href,
      external = false,
      className,
      ...props
    },
    ref,
  ) => {
    // Determine icon size based on button size
    const getIconSize = () => {
      switch (size) {
        case 'sm':
          return 'h-3 w-3';
        case 'lg':
          return 'h-5 w-5';
        default:
          return 'h-4 w-4';
      }
    };

    const iconSize = getIconSize();
    const baseClassName = twMerge(buttonStyles({ intent, size }), className);

    // Determine which icon to show during loading
    const getLoadingIcon = () => {
      if (loadingIcon) return loadingIcon;
      // If the original icon is RefreshCw, use it for loading (it will spin)
      if (Icon === RefreshCw) return RefreshCw;
      // Default to Loader2 for other cases
      return Loader2;
    };

    // Determine the actual icon to render
    const CurrentIcon = isLoading ? getLoadingIcon() : Icon;

    // Add spinning animation class when loading
    const getIconClassName = (baseIconSize: string) => {
      const spinClass = isLoading ? 'animate-spin' : '';
      return `${baseIconSize} ${spinClass}`.trim();
    };

    // Content to render (same for both button and link)
    const content = (
      <>
        {/* Icon only mode */}
        {text === null && CurrentIcon && <CurrentIcon className={getIconClassName(iconSize)} />}

        {/* Icon + Text mode */}
        {text !== null && (
          <>
            {CurrentIcon && iconPosition === 'left' && (
              <CurrentIcon className={getIconClassName(`${iconSize} mr-2`)} />
            )}
            {text}
            {CurrentIcon && iconPosition === 'right' && (
              <CurrentIcon className={getIconClassName(`${iconSize} ml-2`)} />
            )}
          </>
        )}
      </>
    );

    // Render as Link if href is provided
    if (href) {
      if (external) {
        return (
          <a href={href} className={baseClassName} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        );
      }

      return (
        <Link href={href} className={baseClassName}>
          {content}
        </Link>
      );
    }

    // Render as button
    return (
      <button
        ref={ref}
        type={type}
        className={baseClassName}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {content}
      </button>
    );
  },
);
Button.displayName = 'Button';
