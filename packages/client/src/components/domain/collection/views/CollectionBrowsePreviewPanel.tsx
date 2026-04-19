import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Image } from '~/components/ui/Image';
import { Notice } from '~/components/ui/Notice';

import type { CollectionBrowseItem } from './collection-browse-types';

interface PromptPreviewFieldProps {
    label: string;
    value: string;
    rows: number;
    muted?: boolean;
    onCopy: () => void;
}

interface CollectionBrowsePreviewPanelProps {
    selectedItem: CollectionBrowseItem | null;
    onOpenDetail: (collectionId: number) => void;
    onCopyPrompt: () => void;
    onCopyNegativePrompt: () => void;
    onOpenRename: () => void;
    onOpenDelete: () => void;
}

const PromptPreviewField = ({
    label,
    value,
    rows,
    muted = false,
    onCopy,
}: PromptPreviewFieldProps) => {
    const displayValue = value || '-';

    return (
        <section className="min-w-0">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase text-ink-subtle">
                    {label}
                </h3>
                <Button
                    variant="text"
                    size="compact"
                    className="h-7 px-1.5 text-xs"
                    onClick={onCopy}
                >
                    Copy
                </Button>
            </div>
            <textarea
                readOnly
                rows={rows}
                aria-label={label}
                spellCheck={false}
                value={displayValue}
                className={[
                    'ui-focus-ring block max-h-56 min-h-24 w-full resize-y rounded-token-md border border-line bg-surface-muted px-3 py-2 text-sm leading-relaxed outline-none',
                    muted ? 'text-ink-muted' : 'text-ink',
                ].join(' ')}
                onFocus={(event) => {
                    event.currentTarget.select();
                }}
            />
        </section>
    );
};

export const CollectionBrowsePreviewPanel = ({
    selectedItem,
    onOpenDetail,
    onCopyPrompt,
    onCopyNegativePrompt,
    onOpenRename,
    onOpenDelete,
}: CollectionBrowsePreviewPanelProps) => {
    const imageSize =
        selectedItem?.image.width && selectedItem.image.height
            ? `${selectedItem.image.width}x${selectedItem.image.height}`
            : null;

    return (
        <Card className="order-1 h-fit xl:order-2 xl:sticky xl:top-20 xl:self-start xl:min-h-[68vh]">
            {selectedItem ? (
                <>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium text-ink-subtle">
                                Selected
                            </p>
                            <h2 className="text-lg font-semibold text-ink">
                                {selectedItem.title || '(untitled)'}
                            </h2>
                            <p className="mt-1 text-xs text-ink-muted">
                                Collection #{selectedItem.id}
                                {imageSize ? ` - ${imageSize}` : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    onOpenDetail(selectedItem.id);
                                }}
                            >
                                Open detail
                            </Button>
                            <Button
                                variant="control"
                                size="sm"
                                onClick={onOpenRename}
                            >
                                Rename
                            </Button>
                            <Button
                                variant="text"
                                size="sm"
                                className="text-danger-700 hover:text-danger-700"
                                onClick={onOpenDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-token-lg border border-line bg-surface-muted">
                        <Image
                            src={selectedItem.image.url}
                            alt={selectedItem.title || '(untitled)'}
                            width={selectedItem.image.width}
                            height={selectedItem.image.height}
                            className="block max-h-[52vh] w-full object-contain sm:max-h-[62vh] xl:max-h-[70vh]"
                        />
                    </div>

                    <div className="mt-3 grid gap-3 border-t border-line pt-3">
                        <PromptPreviewField
                            label="Prompt"
                            value={selectedItem.prompt}
                            rows={6}
                            onCopy={onCopyPrompt}
                        />

                        <PromptPreviewField
                            label="Negative"
                            value={selectedItem.negativePrompt}
                            rows={4}
                            muted
                            onCopy={onCopyNegativePrompt}
                        />
                    </div>
                </>
            ) : (
                <Notice variant="neutral">
                    Select a collection from the gallery to preview it.
                </Notice>
            )}
        </Card>
    );
};
