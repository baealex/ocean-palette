import { useId, useMemo } from 'react';

import { ActionGroup } from '~/components/ui/ActionGroup';
import { Button } from '~/components/ui/Button';
import { Field, FieldLabel } from '~/components/ui/Field';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { cn } from '~/components/ui/cn';
import type { CollectionSearchBy } from '~/api';
import { parseCollectionSearchBy } from '~/features/collection/view-filter';
import { CrossIcon, SearchIcon } from '~/icons';

interface CollectionSearchBarProps {
    value: string;
    searchBy: CollectionSearchBy;
    canReset?: boolean;
    placeholder?: string;
    className?: string;
    embedded?: boolean;
    onChange: (value: string) => void;
    onSearchByChange: (nextSearchBy: CollectionSearchBy) => void;
    onSubmit: () => void;
    onReset?: () => void;
}

export const CollectionSearchBar = ({
    value,
    searchBy,
    canReset = false,
    placeholder = 'Search',
    className,
    embedded = false,
    onChange,
    onSearchByChange,
    onSubmit,
    onReset,
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
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                        <legend className="mb-1.5 text-xs font-semibold text-ink-muted">
                            Search
                        </legend>
                        <div className="grid gap-2 sm:grid-cols-[168px_minmax(0,1fr)]">
                            <Field>
                                <FieldLabel
                                    id="collection-search-field-label"
                                    className="sr-only"
                                >
                                    Search field
                                </FieldLabel>
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
                            </Field>
                            <Field>
                                <FieldLabel
                                    htmlFor={inputId}
                                    className="sr-only"
                                >
                                    Keyword
                                </FieldLabel>
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
                            </Field>
                        </div>
                    </fieldset>
                    <ActionGroup className="md:self-end">
                        {onReset ? (
                            <Button
                                type="button"
                                variant="text"
                                size="control"
                                className="min-w-[72px]"
                                disabled={!canReset}
                                onClick={onReset}
                            >
                                Reset
                            </Button>
                        ) : null}
                        <Button
                            type="submit"
                            variant="primary"
                            size="control"
                            className="min-w-[88px]"
                            aria-label="Run collection search"
                        >
                            Search
                        </Button>
                    </ActionGroup>
                </div>
            </div>
        </form>
    );
};
