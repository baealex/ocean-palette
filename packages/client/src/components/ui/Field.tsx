import type { HTMLAttributes, LabelHTMLAttributes } from 'react';

import { cn } from './cn';

type FieldLabelTone = 'compact' | 'default';
type FieldMessageTone = 'muted' | 'warning' | 'danger';

type FieldProps = HTMLAttributes<HTMLDivElement>;

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    tone?: FieldLabelTone;
}

interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
    tone?: FieldMessageTone;
}

const LABEL_TONE_CLASS: Record<FieldLabelTone, string> = {
    compact: 'mb-1 block text-[11px] font-semibold uppercase text-ink-subtle',
    default: 'mb-1.5 block text-xs font-semibold text-ink-muted',
};

const MESSAGE_TONE_CLASS: Record<FieldMessageTone, string> = {
    muted: 'text-ink-subtle',
    warning: 'text-warning-700',
    danger: 'text-danger-700',
};

export const Field = ({ className, ...props }: FieldProps) => {
    return <div className={cn('min-w-0', className)} {...props} />;
};

export const FieldLabel = ({
    tone = 'compact',
    className,
    ...props
}: FieldLabelProps) => {
    return (
        <label className={cn(LABEL_TONE_CLASS[tone], className)} {...props} />
    );
};

export const FieldMessage = ({
    tone = 'muted',
    className,
    ...props
}: FieldMessageProps) => {
    return (
        <p
            className={cn(
                'mt-1 text-xs font-medium',
                MESSAGE_TONE_CLASS[tone],
                className,
            )}
            {...props}
        />
    );
};
