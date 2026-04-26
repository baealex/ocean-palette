import { Button } from '~/components/ui/Button';

import { MetadataList, type MetadataRow } from './MetadataList';

interface GeneratedMetadataPanelProps {
    rows: MetadataRow[];
    emptyMessage: string;
    warnings?: string[];
    note?: string | null;
    onCopyJson?: () => void;
}

export const GeneratedMetadataPanel = ({
    rows,
    emptyMessage,
    warnings = [],
    note = null,
    onCopyJson,
}: GeneratedMetadataPanelProps) => {
    return (
        <section className="space-y-4">
            <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-ink">
                        Generated Metadata
                    </h3>
                    {onCopyJson ? (
                        <Button
                            variant="text"
                            size="compact"
                            className="h-8 px-1.5"
                            onClick={onCopyJson}
                        >
                            Copy JSON
                        </Button>
                    ) : null}
                </div>

                <MetadataList rows={rows} emptyMessage={emptyMessage} />

                {note ? (
                    <p className="mt-2 text-xs text-ink-subtle">{note}</p>
                ) : null}
            </div>

            {warnings.length > 0 ? (
                <div className="border-l-2 border-orange-200 pl-3">
                    <p className="text-xs font-semibold text-amber-700">
                        Parse Warnings
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-amber-700">
                        {warnings.map((warning) => (
                            <li key={warning}>- {warning}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </section>
    );
};
