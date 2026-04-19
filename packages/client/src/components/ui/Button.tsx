import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from './cn';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'soft'
    | 'control'
    | 'text'
    | 'tab';
type ButtonSize =
    | 'sm'
    | 'md'
    | 'lg'
    | 'icon'
    | 'control'
    | 'compact'
    | 'compactIcon'
    | 'tab';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const BASE_CLASS =
    'ui-focus-ring inline-flex items-center justify-center gap-2 rounded-token-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary:
        'border border-brand-700 bg-brand-700 text-white hover:bg-brand-800',
    secondary:
        'border border-line-strong bg-surface-base text-ink-muted hover:bg-surface-muted',
    danger: 'border border-danger-700 bg-danger-700 text-white hover:bg-danger-800',
    ghost: 'border border-transparent bg-transparent text-ink-muted hover:bg-surface-muted',
    soft: 'border border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100',
    control:
        'border border-line bg-surface-base text-ink shadow-none tracking-normal hover:bg-surface-raised',
    text: 'border border-transparent bg-transparent text-ink-muted shadow-none tracking-normal hover:text-ink',
    tab: 'border border-transparent bg-transparent text-ink-muted shadow-none tracking-normal hover:bg-surface-base/60 hover:text-ink aria-pressed:bg-transparent aria-pressed:text-brand-700 aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-8 aria-pressed:hover:bg-transparent aria-pressed:hover:text-brand-800',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: 'h-11 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-sm',
    icon: 'h-11 w-11',
    control: 'h-10 px-4 text-sm',
    compact: 'h-10 px-3 text-xs',
    compactIcon: 'h-8 w-8',
    tab: 'h-10 px-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'secondary',
            size = 'md',
            className,
            type = 'button',
            ...props
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    BASE_CLASS,
                    VARIANT_CLASS[variant],
                    SIZE_CLASS[size],
                    className,
                )}
                {...props}
            />
        );
    },
);

Button.displayName = 'Button';
