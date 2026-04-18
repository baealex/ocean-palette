import { useId, useMemo } from 'react';

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { cn } from '~/components/ui/cn';
import type { CollectionSearchBy } from '~/api';
import { parseCollectionSearchBy } from '~/features/collection/view-filter';
import { CrossIcon, SearchIcon } from '~/icons';

interface CollectionSearchBarProps {
    value: string;
    searchBy: CollectionSearchBy;
    placeholder?: string;
    className?: string;
    embedded?: boolean;
    onChange: (value: string) => void;
    onSearchByChange: (nextSearchBy: CollectionSearchBy) => void;
    onSubmit: () => void;
}

export const CollectionSearchBar = ({
    value,
    searchBy,
    placeholder = 'Search',
    className,
    embedded = false,
    onChange,
    onSearchByChange,
    onSubmit,
}: CollectionSearchBarProps) => {
    const hasQuery = useMemo(() => value.trim().length > 0, [value]);
    const inputId = useId();
    const searchById = useId();

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className={cn('w-full', className)}
        >
            <div
                className={cn(
                    'grid gap-2',
                    embedded ? '' : 'p-1.5',
                    !embedded &&
                        'rounded-token-lg border-2 border-brand-200 bg-surface-raised shadow-surface',
                )}
            >
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <div className="grid gap-2 sm:grid-cols-[184px_minmax(0,1fr)]">
                        <div>
                            <label
                                id="collection-search-field-label"
                                className="mb-1 block text-[11px] font-semibold uppercase text-ink-subtle"
                            >
                                Field
                            </label>
                            <Select
                                id={searchById}
                                ariaLabelledBy="collection-search-field-label"
                                value={searchBy}
                                size="control"
                                tone="control"
                                options={[
                                    { value: 'title', label: 'Title' },
                                    { value: 'prompt', label: 'Prompt' },
                                    {
                                        value: 'negative_prompt',
                                        label: 'Negative prompt',
                                    },
                                ]}
                                onValueChange={(nextValue) => {
                                    onSearchByChange(
                                        parseCollectionSearchBy(nextValue),
                                    );
                                }}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor={inputId}
                                className="mb-1 block text-[11px] font-semibold uppercase text-ink-subtle"
                            >
                                Keyword
                            </label>
                            <div className="relative min-w-0">
                                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                                <Input
                                    id={inputId}
                                    value={value}
                                    inputSize="control"
                                    tone="control"
                                    onChange={(event) => {
                                        onChange(event.target.value);
                                    }}
                                    placeholder={placeholder}
                                    className={cn(
                                        'pl-9',
                                        hasQuery ? 'pr-10' : 'pr-3',
                                    )}
                                />
                                {hasQuery ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="compactIcon"
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-token-sm text-ink-subtle hover:text-ink"
                                        aria-label="Clear search query"
                                        onClick={() => {
                                            onChange('');
                                        }}
                                    >
                                        <CrossIcon width={14} height={14} />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <Button
                            type="submit"
                            variant="control"
                            size="control"
                            className="min-w-[88px]"
                            aria-label="Run collection search"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
