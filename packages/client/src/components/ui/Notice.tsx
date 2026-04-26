import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';
import { STATUS_INTENT_CLASS, type StatusIntent } from './status-styles';

type NoticeVariant = StatusIntent | 'neutral';

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: NoticeVariant;
    title?: string;
    children?: ReactNode;
}

const VARIANT_CLASS: Record<NoticeVariant, string> = {
    ...STATUS_INTENT_CLASS,
    neutral: 'border-line bg-surface-muted text-ink-muted',
};

export const Notice = ({
    variant = 'neutral',
    title,
    className,
    children,
    ...props
}: NoticeProps) => {
    return (
        <div
            role="status"
            className={cn(
                'rounded-token-md border p-3 text-sm',
                VARIANT_CLASS[variant],
                className,
            )}
            {...props}
        >
            {title ? <p className="mb-1 font-semibold">{title}</p> : null}
            {children}
        </div>
    );
};
