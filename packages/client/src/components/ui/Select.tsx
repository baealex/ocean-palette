import * as SelectPrimitive from '@radix-ui/react-select';

import { ChevronDownIcon } from '~/icons';

import { cn } from './cn';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

type SelectSize = 'default' | 'control';
type SelectTone = 'default' | 'control';

interface SelectProps {
    value: string;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    ariaLabelledBy?: string;
    size?: SelectSize;
    tone?: SelectTone;
    triggerClassName?: string;
    contentClassName?: string;
    onValueChange: (value: string) => void;
}

const TRIGGER_BASE_CLASS =
    'ui-focus-ring inline-flex w-full items-center justify-between gap-2 rounded-token-md border px-3 text-left text-sm text-ink disabled:cursor-not-allowed disabled:opacity-55';

const TRIGGER_SIZE_CLASS: Record<SelectSize, string> = {
    default: 'h-11',
    control: 'h-10',
};

const TRIGGER_TONE_CLASS: Record<SelectTone, string> = {
    default: 'border-line-strong bg-surface-base',
    control: 'border-line bg-surface-base shadow-none',
};

export const Select = ({
    value,
    options,
    placeholder,
    disabled = false,
    id,
    ariaLabelledBy,
    size = 'default',
    tone = 'default',
    triggerClassName,
    contentClassName,
    onValueChange,
}: SelectProps) => {
    return (
        <SelectPrimitive.Root
            value={value}
            disabled={disabled}
            onValueChange={onValueChange}
        >
            <SelectPrimitive.Trigger
                id={id}
                aria-labelledby={ariaLabelledBy}
                className={cn(
                    TRIGGER_BASE_CLASS,
                    TRIGGER_SIZE_CLASS[size],
                    TRIGGER_TONE_CLASS[tone],
                    triggerClassName,
                )}
            >
                <SelectPrimitive.Value placeholder={placeholder} />
                <SelectPrimitive.Icon asChild>
                    <ChevronDownIcon
                        width={14}
                        height={14}
                        className="shrink-0 text-ink-subtle"
                    />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={8}
                    className={cn(
                        'z-40 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-token-md border border-line bg-surface-base shadow-raised',
                        contentClassName,
                    )}
                >
                    <SelectPrimitive.Viewport className="max-h-72 p-1">
                        {options.map((option) => (
                            <SelectPrimitive.Item
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="ui-focus-ring relative flex h-11 cursor-default select-none items-center rounded-token-sm px-3 text-sm font-medium text-ink outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-surface-muted data-[highlighted]:text-ink"
                            >
                                <SelectPrimitive.ItemText>
                                    {option.label}
                                </SelectPrimitive.ItemText>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
};
