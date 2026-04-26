import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from './cn';

type InputSize = 'default' | 'control';
type InputTone = 'default' | 'control';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
    inputSize?: InputSize;
    tone?: InputTone;
}

const INPUT_BASE_CLASS =
    'ui-focus-ring w-full rounded-token-md border bg-surface-base px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle';

const INPUT_SIZE_CLASS: Record<InputSize, string> = {
    default: 'h-11',
    control: 'h-10',
};

const INPUT_TONE_CLASS: Record<InputTone, string> = {
    default: 'border-line-strong focus-visible:border-brand-500',
    control: 'border-line focus-visible:border-line-strong',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            invalid = false,
            inputSize = 'default',
            tone = 'default',
            ...props
        },
        ref,
    ) => {
        return (
            <input
                ref={ref}
                className={cn(
                    INPUT_BASE_CLASS,
                    INPUT_SIZE_CLASS[inputSize],
                    invalid ? 'border-red-700' : INPUT_TONE_CLASS[tone],
                    className,
                )}
                {...props}
            />
        );
    },
);

Input.displayName = 'Input';
