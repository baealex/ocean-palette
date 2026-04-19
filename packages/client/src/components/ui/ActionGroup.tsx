import type { HTMLAttributes } from 'react';

import { cn } from './cn';

type ActionGroupAlign = 'start' | 'end' | 'between';

interface ActionGroupProps extends HTMLAttributes<HTMLDivElement> {
    align?: ActionGroupAlign;
    wrap?: boolean;
}

const ALIGN_CLASS: Record<ActionGroupAlign, string> = {
    start: 'justify-start',
    end: 'justify-end',
    between: 'justify-between',
};

export const ActionGroup = ({
    align = 'end',
    wrap = false,
    className,
    ...props
}: ActionGroupProps) => {
    return (
        <div
            className={cn(
                'flex items-center gap-2',
                ALIGN_CLASS[align],
                wrap ? 'flex-wrap' : '',
                className,
            )}
            {...props}
        />
    );
};
