import { Button } from '~/components/ui/Button';
import { Select, type SelectOption } from '~/components/ui/Select';
import type { CollectionSort } from '~/features/collection/view-filter';

interface CollectionPrimaryFiltersSectionProps {
    model: string;
    sort: CollectionSort;
    canReset: boolean;
    loadingModelOptions: boolean;
    modelOptionsError: string | null;
    resolvedModelOptions: string[];
    modelSelectOptions: SelectOption[];
    sortSelectOptions: SelectOption[];
    modelAllValue: string;
    onModelChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onReset: () => void;
}

export const CollectionPrimaryFiltersSection = ({
    model,
    sort,
    canReset,
    loadingModelOptions,
    modelOptionsError,
    resolvedModelOptions,
    modelSelectOptions,
    sortSelectOptions,
    modelAllValue,
    onModelChange,
    onSortChange,
    onReset,
}: CollectionPrimaryFiltersSectionProps) => {
    return (
        <section
            aria-labelledby="collection-primary-filter-group-label"
            className="grid gap-2 sm:grid-cols-2 md:grid-cols-[repeat(2,minmax(0,1fr))_auto] md:items-end"
        >
            <h3 id="collection-primary-filter-group-label" className="sr-only">
                Primary filters
            </h3>
            <div>
                <label
                    id="collection-model-filter-label"
                    className="mb-1 block text-[11px] font-semibold uppercase text-ink-subtle"
                >
                    Model
                </label>
                <Select
                    id="collection-model-filter"
                    ariaLabelledBy="collection-model-filter-label"
                    value={model || modelAllValue}
                    options={modelSelectOptions}
                    onValueChange={(nextValue) => {
                        onModelChange(
                            nextValue === modelAllValue ? '' : nextValue,
                        );
                    }}
                    disabled={
                        loadingModelOptions && resolvedModelOptions.length === 0
                    }
                    triggerClassName="!h-10 border-line bg-surface-base text-sm shadow-none"
                />
                {modelOptionsError ? (
                    <p className="mt-1 text-xs font-medium text-warning-700">
                        Model options could not be loaded. You can still browse
                        all models.
                    </p>
                ) : null}
            </div>
            <div>
                <label
                    id="collection-sort-filter-label"
                    className="mb-1 block text-[11px] font-semibold uppercase text-ink-subtle"
                >
                    Sort
                </label>
                <Select
                    id="collection-sort-filter"
                    ariaLabelledBy="collection-sort-filter-label"
                    value={sort}
                    options={sortSelectOptions}
                    onValueChange={onSortChange}
                    triggerClassName="!h-10 border-line bg-surface-base text-sm shadow-none"
                />
            </div>

            <Button
                type="button"
                variant="ghost"
                size="md"
                className="!h-10 px-3 text-xs sm:justify-self-start md:justify-self-end"
                disabled={!canReset}
                onClick={onReset}
            >
                Reset
            </Button>
        </section>
    );
};
