import { Button } from '~/components/ui/Button';
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
    onClickOpenDetail?: () => void;
    onClickRename?: () => void;
    onClickDelete: () => void;
    renaming?: boolean;
    removing?: boolean;
}

export const CollectionCard = ({
    collection,
    onClickCopy,
    onClickOpenDetail,
    onClickRename,
    onClickDelete,
    renaming = false,
    removing = false,
}: CollectionCardProps) => {
    const displayTitle = collection.title || '(untitled)';

    return (
        <Card as="article" padding="none" className="mb-3 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                {onClickOpenDetail ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="compact"
                        className="group !h-auto aspect-[4/3] w-full !justify-start gap-0 overflow-hidden rounded-none border-0 bg-surface-muted p-0 text-left font-normal shadow-none hover:bg-surface-muted md:aspect-auto md:h-full md:min-h-[232px]"
                        onClick={onClickOpenDetail}
                    >
                        <Image
                            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            alt={displayTitle}
                            src={collection.image.url}
                            width={collection.image.width}
                            height={collection.image.height}
                        />
                    </Button>
                ) : (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-surface-muted md:aspect-auto md:h-full md:min-h-[232px]">
                        <Image
                            className="block h-full w-full object-cover"
                            alt={displayTitle}
                            src={collection.image.url}
                            width={collection.image.width}
                            height={collection.image.height}
                        />
                    </div>
                )}

                <div className="grid min-w-0 content-start gap-3 border-t border-line p-3 md:border-l md:border-t-0 sm:p-4">
                    <header className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-ink-subtle">
                                #{collection.id}
                            </p>
                            {onClickOpenDetail ? (
                                <Button
                                    type="button"
                                    variant="text"
                                    size="compact"
                                    className="mt-0.5 !h-auto max-w-full justify-start p-0 text-left text-base font-semibold text-ink hover:text-brand-700"
                                    onClick={onClickOpenDetail}
                                >
                                    <span className="block truncate">
                                        {displayTitle}
                                    </span>
                                </Button>
                            ) : (
                                <h2 className="mt-0.5 truncate text-base font-semibold text-ink">
                                    {displayTitle}
                                </h2>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            {onClickOpenDetail ? (
                                <IconButton
                                    icon={
                                        <ArrowRightIcon
                                            width={14}
                                            height={14}
                                        />
                                    }
                                    label="Open detail"
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9"
                                    onClick={onClickOpenDetail}
                                />
                            ) : null}
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
                        size="compact"
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
