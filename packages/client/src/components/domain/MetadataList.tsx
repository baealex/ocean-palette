import { cn } from '~/components/ui/cn';

export interface MetadataRow {
    label: string;
    value?: string | number | null;
}

interface MetadataListProps {
    rows: MetadataRow[];
    emptyMessage: string;
    className?: string;
}

export const MetadataList = ({
    rows,
    emptyMessage,
    className,
}: MetadataListProps) => {
    const visibleRows = rows.filter((row) => {
        if (row.value === null || row.value === undefined) {
            return false;
        }
        return String(row.value).length > 0;
    });

    if (visibleRows.length === 0) {
        return (
            <p className="border-y border-line/70 py-2 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
                {emptyMessage}
            </p>
        );
    }

    return (
        <dl className={cn('space-y-0', className)}>
            {visibleRows.map((item) => (
                <div
                    key={item.label}
                    className="grid grid-cols-[minmax(96px,0.42fr)_minmax(0,1fr)] gap-3 border-b border-line/70 py-2 text-xs first:border-t first:border-line/70"
                >
                    <dt className="font-semibold text-ink">{item.label}</dt>
                    <dd className="min-w-0 break-words text-right text-ink-muted">
                        {item.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
};
