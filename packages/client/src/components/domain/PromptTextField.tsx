import { Button } from '~/components/ui/Button';
import { Textarea } from '~/components/ui/Textarea';
import { cn } from '~/components/ui/cn';

type PromptTextFieldSize = 'compact' | 'standard' | 'preview' | 'detail';
type PromptTextFieldLabelStyle = 'caption' | 'title';
type PromptTextFieldCopyTone = 'text' | 'control';
type PromptTextFieldSurface = 'base' | 'muted';

interface PromptTextFieldProps {
    title: string;
    value: string;
    rows: number;
    size?: PromptTextFieldSize;
    labelStyle?: PromptTextFieldLabelStyle;
    copyTone?: PromptTextFieldCopyTone;
    surface?: PromptTextFieldSurface;
    muted?: boolean;
    emptyValue?: string;
    className?: string;
    textareaClassName?: string;
    onCopy?: () => void;
}

const LABEL_CLASS: Record<PromptTextFieldLabelStyle, string> = {
    caption: 'text-[11px] font-semibold uppercase text-ink-subtle',
    title: 'text-sm font-semibold text-ink',
};

export const PromptTextField = ({
    title,
    value,
    rows,
    size = 'standard',
    labelStyle = 'caption',
    copyTone = 'text',
    surface = 'base',
    muted = false,
    emptyValue = '-',
    className,
    textareaClassName,
    onCopy,
}: PromptTextFieldProps) => {
    const displayValue = value || emptyValue;

    return (
        <section className={cn('min-w-0', className)}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h3 className={LABEL_CLASS[labelStyle]}>{title}</h3>
                {onCopy ? (
                    <Button
                        variant={copyTone === 'control' ? 'control' : 'text'}
                        size="compact"
                        className={cn(
                            copyTone === 'control'
                                ? undefined
                                : 'h-7 px-1.5 text-xs',
                        )}
                        onClick={onCopy}
                    >
                        Copy
                    </Button>
                ) : null}
            </div>
            <Textarea
                readOnly
                rows={rows}
                aria-label={title}
                spellCheck={false}
                value={displayValue}
                textareaSize={size}
                tone={surface}
                textTone={muted ? 'muted' : 'default'}
                selectOnFocus
                className={textareaClassName}
            />
        </section>
    );
};
