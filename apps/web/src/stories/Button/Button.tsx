import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';

const buttonStyles = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-2xl',
    'transition-colors duration-200',
    'font-semibold text-center',
    'cursor-pointer',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      intent: {
        primary:
          'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-primary-foreground',
        secondary: 'bg-transparent hover:bg-muted/40 border-2 border-muted text-primary/70',
        success:
          'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white',
        warning:
          'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white',
        danger:
          'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white',
        ghost: 'bg-transparent hover:bg-muted/50',
        download:
          'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-primary-foreground',
        add: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
        favorite: 'border border-pink-200 text-pink-600 hover:bg-pink-50',
        edit: 'border border-blue-200 text-blue-600 hover:bg-blue-50',
        icon: 'bg-transparent hover:bg-muted/40 border-2 border-muted text-primary/70',
      },
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-4 text-lg',
      },
    },
    compoundVariants: [
      { intent: 'icon', size: 'sm', class: 'w-8 p-0' },
      { intent: 'icon', size: 'md', class: 'w-10 p-0' },
      { intent: 'icon', size: 'lg', class: 'w-12 p-0' },
    ],
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonStyles>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {}

// ========= Text / Icon + Text Button =========
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(buttonStyles({ intent, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

// ========= Icon Button =========
export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps & { icon: LucideIcon }>(
  ({ className, size, intent = 'icon', icon, type = 'button', ...props }, ref) => {
    const iconSize = size === 'lg' ? 24 : size === 'sm' ? 16 : 20;

    // Render the icon, supporting both component and element
    const renderIcon = () => {
      if (React.isValidElement(icon)) {
        // element case: <Plus />
        return React.cloneElement(
          icon as React.ReactElement<{ size?: number; 'aria-hidden'?: boolean }>,
          {
            size: iconSize,
            'aria-hidden': true,
          },
        );
      }
      // component type case: Plus
      const IconComp = icon as LucideIcon;
      return <IconComp size={iconSize} aria-hidden="true" />;
    };

    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(buttonStyles({ intent, size }), className)}
        {...props}
      >
        {renderIcon()}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
