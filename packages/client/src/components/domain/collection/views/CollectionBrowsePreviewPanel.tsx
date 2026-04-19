import { Link } from '@tanstack/react-router';

import { Card } from '~/components/ui/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { IconButton } from '~/components/ui/IconButton';
import { Image } from '~/components/ui/Image';
import { Notice } from '~/components/ui/Notice';
import { PromptTextField } from '~/components/domain/PromptTextField';
import { ArrowRightIcon, MoreIcon } from '~/icons';

import type { CollectionBrowseItem } from './collection-browse-types';

interface CollectionBrowsePreviewPanelProps {
    selectedItem: CollectionBrowseItem | null;
    onCopyPrompt: () => void;
    onCopyNegativePrompt: () => void;
    onOpenRename: () => void;
    onOpenDelete: () => void;
}

export const CollectionBrowsePreviewPanel = ({
    selectedItem,
    onCopyPrompt,
    onCopyNegativePrompt,
    onOpenRename,
    onOpenDelete,
}: CollectionBrowsePreviewPanelProps) => {
    const imageSize =
        selectedItem?.image.width && selectedItem.image.height
            ? `${selectedItem.image.width} x ${selectedItem.image.height}`
            : null;
    const displayTitle = selectedItem?.title || '(untitled)';
    const detailParams = selectedItem ? { id: String(selectedItem.id) } : null;

    return (
        <Card
            padding="none"
            className="order-1 h-fit overflow-hidden xl:order-2 xl:sticky xl:top-20 xl:self-start xl:min-h-[68vh]"
        >
            {selectedItem && detailParams ? (
                <>
                    <header className="flex min-w-0 items-start justify-between gap-3 p-3 sm:p-4">
                        <div className="min-w-0">
                            <h2 className="min-w-0">
                                <Link
                                    to="/collection/$id"
                                    params={detailParams}
                                    className="ui-focus-ring group block w-full min-w-0 rounded-token-sm text-left"
                                >
                                    <span className="block truncate text-lg font-semibold text-ink transition-colors group-hover:text-brand-700">
                                        {displayTitle}
                                    </span>
                                </Link>
                            </h2>
                            <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink-subtle">
                                <span>#{selectedItem.id}</span>
                                {imageSize ? (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <span>{imageSize}</span>
                                    </>
                                ) : null}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Link
                                to="/collection/$id"
                                params={detailParams}
                                aria-label="Open detail"
                                className="ui-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-token-md border border-transparent text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                            >
                                <ArrowRightIcon width={14} height={14} />
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        icon={
                                            <MoreIcon width={16} height={16} />
                                        }
                                        label="Collection actions"
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8}>
                                    <DropdownMenuItem onSelect={onOpenRename}>
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-danger-700 data-[highlighted]:bg-danger-50 data-[highlighted]:text-danger-700"
                                        onSelect={onOpenDelete}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <Link
                        to="/collection/$id"
                        params={detailParams}
                        className="ui-focus-ring block border-t border-line bg-surface-muted"
                        aria-label={`Open ${displayTitle}`}
                    >
                        <Image
                            src={selectedItem.image.url}
                            alt={displayTitle}
                            width={selectedItem.image.width}
                            height={selectedItem.image.height}
                            className="block max-h-[52vh] w-full object-contain sm:max-h-[62vh] xl:max-h-[70vh]"
                        />
                    </Link>

                    <div className="grid gap-3 border-t border-line p-3 sm:p-4">
                        <PromptTextField
                            title="Prompt"
                            value={selectedItem.prompt}
                            rows={6}
                            size="preview"
                            onCopy={onCopyPrompt}
                        />

                        <PromptTextField
                            title="Negative"
                            value={selectedItem.negativePrompt}
                            rows={4}
                            size="preview"
                            muted
                            className="border-t border-line/70 pt-2"
                            onCopy={onCopyNegativePrompt}
                        />
                    </div>
                </>
            ) : (
                <div className="p-3 sm:p-4">
                    <Notice variant="neutral">
                        Select a collection from the gallery to preview it.
                    </Notice>
                </div>
            )}
        </Card>
    );
};
