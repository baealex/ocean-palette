import type { TextareaHTMLAttributes } from 'react';

import { cn } from './cn';

type TextareaSize = 'compact' | 'standard' | 'preview' | 'detail';
type TextareaTone = 'base' | 'muted';
type TextareaTextTone = 'default' | 'muted';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    textareaSize?: TextareaSize;
    tone?: TextareaTone;
    textTone?: TextareaTextTone;
    selectOnFocus?: boolean;
}

const BASE_CLASS =
    'ui-focus-ring block w-full resize-y rounded-token-sm border px-3 py-2 leading-relaxed outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const SIZE_CLASS: Record<TextareaSize, string> = {
    compact: 'max-h-36 min-h-20 text-xs',
    standard: 'max-h-48 min-h-28 text-sm',
    preview: 'max-h-56 min-h-24 text-sm',
    detail: 'max-h-[42vh] min-h-36 text-sm',
};

const TONE_CLASS: Record<TextareaTone, string> = {
    base: 'border-line/70 bg-surface-base',
    muted: 'border-line bg-surface-muted',
};

const TEXT_TONE_CLASS: Record<TextareaTextTone, string> = {
    default: 'text-ink',
    muted: 'text-ink-muted',
};

export const Textarea = ({
    textareaSize = 'standard',
    tone = 'base',
    textTone = 'default',
    selectOnFocus = false,
    className,
    onFocus,
    ...props
}: TextareaProps) => {
    return (
        <textarea
            className={cn(
                BASE_CLASS,
                SIZE_CLASS[textareaSize],
                TONE_CLASS[tone],
                TEXT_TONE_CLASS[textTone],
                className,
            )}
            onFocus={(event) => {
                if (selectOnFocus) {
                    event.currentTarget.select();
                }
                onFocus?.(event);
            }}
            {...props}
        />
    );
};
