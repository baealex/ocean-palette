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
import { ArrowRightIcon, MoreIcon } from '~/icons';
import type { Collection } from '~/models/types';
import { PromptTextField } from './PromptTextField';

interface CollectionCardProps {
    collection: Collection;
    onClickCopy: (text: string, label?: string) => void;
    onClickRename?: () => void;
    onClickDelete: () => void;
    renaming?: boolean;
    removing?: boolean;
}

export const CollectionCard = ({
    collection,
    onClickCopy,
    onClickRename,
    onClickDelete,
    renaming = false,
    removing = false,
}: CollectionCardProps) => {
    const displayTitle = collection.title || '(untitled)';
    const detailParams = { id: String(collection.id) };

    return (
        <Card as="article" padding="none" className="mb-3 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                <Link
                    to="/collection/$id"
                    params={detailParams}
                    className="ui-focus-ring group block aspect-[4/3] w-full overflow-hidden bg-surface-muted md:aspect-auto md:h-full md:min-h-[232px]"
                    aria-label={`Open ${displayTitle}`}
                >
                    <Image
                        className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        alt={displayTitle}
                        src={collection.image.url}
                        width={collection.image.width}
                        height={collection.image.height}
                    />
                </Link>

                <div className="grid min-w-0 content-start gap-3 border-t border-line p-3 md:border-l md:border-t-0 sm:p-4">
                    <header className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="min-w-0">
                                <Link
                                    to="/collection/$id"
                                    params={detailParams}
                                    className="ui-focus-ring group block w-full min-w-0 rounded-token-sm text-left"
                                >
                                    <span className="block truncate text-base font-semibold text-ink transition-colors group-hover:text-brand-700">
                                        {displayTitle}
                                    </span>
                                </Link>
                            </h2>
                            <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink-subtle">
                                <span>#{collection.id}</span>
                                <span aria-hidden="true">/</span>
                                <span>
                                    {collection.image.width} x{' '}
                                    {collection.image.height}
                                </span>
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
                                        disabled={renaming || removing}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8}>
                                    {onClickRename ? (
                                        <DropdownMenuItem
                                            onSelect={() => {
                                                onClickRename();
                                            }}
                                            disabled={renaming || removing}
                                        >
                                            {renaming
                                                ? 'Renaming...'
                                                : 'Rename'}
                                        </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuItem
                                        className="text-danger-700 data-[highlighted]:bg-danger-50 data-[highlighted]:text-danger-700"
                                        onSelect={() => {
                                            onClickDelete();
                                        }}
                                        disabled={removing || renaming}
                                    >
                                        {removing ? 'Removing...' : 'Delete'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <PromptTextField
                        title="Prompt"
                        value={collection.prompt}
                        rows={5}
                        size="standard"
                        onCopy={() => {
                            onClickCopy(collection.prompt, 'Prompt');
                        }}
                    />

                    <PromptTextField
                        title="Negative"
                        value={collection.negativePrompt}
                        rows={3}
                        size="standard"
                        muted
                        className="border-t border-line/70 pt-2"
                        onCopy={() => {
                            onClickCopy(
                                collection.negativePrompt,
                                'Negative prompt',
                            );
                        }}
                    />
                </div>
            </div>
        </Card>
    );
};
