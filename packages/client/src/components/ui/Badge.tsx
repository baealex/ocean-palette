import type { HTMLAttributes } from 'react';

import { cn } from './cn';
import { STATUS_INTENT_CLASS } from './status-styles';

type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
    neutral: 'border-line-strong bg-surface-muted text-ink-muted',
    info: STATUS_INTENT_CLASS.info,
    success: STATUS_INTENT_CLASS.success,
    warning: STATUS_INTENT_CLASS.warning,
    danger: STATUS_INTENT_CLASS.error,
};

export const Badge = ({
    variant = 'neutral',
    className,
    ...props
}: BadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                VARIANT_CLASS[variant],
                className,
            )}
            {...props}
        />
    );
};
