import { Select, type SelectOption } from '~/components/ui/Select';
import type { CollectionSort } from '~/features/collection/view-filter';

interface CollectionPrimaryFiltersSectionProps {
    model: string;
    sort: CollectionSort;
    loadingModelOptions: boolean;
    modelOptionsError: string | null;
    resolvedModelOptions: string[];
    modelSelectOptions: SelectOption[];
    sortSelectOptions: SelectOption[];
    modelAllValue: string;
    onModelChange: (value: string) => void;
    onSortChange: (value: string) => void;
}

export const CollectionPrimaryFiltersSection = ({
    model,
    sort,
    loadingModelOptions,
    modelOptionsError,
    resolvedModelOptions,
    modelSelectOptions,
    sortSelectOptions,
    modelAllValue,
    onModelChange,
    onSortChange,
}: CollectionPrimaryFiltersSectionProps) => {
    return (
        <section
            aria-labelledby="collection-primary-filter-group-label"
            className="grid gap-2 sm:grid-cols-2 md:grid-cols-[repeat(2,minmax(220px,260px))] md:items-end md:justify-start"
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
                    size="control"
                    tone="control"
                    options={modelSelectOptions}
                    onValueChange={(nextValue) => {
                        onModelChange(
                            nextValue === modelAllValue ? '' : nextValue,
                        );
                    }}
                    disabled={
                        loadingModelOptions && resolvedModelOptions.length === 0
                    }
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
                    size="control"
                    tone="control"
                    options={sortSelectOptions}
                    onValueChange={onSortChange}
                />
            </div>
        </section>
    );
};
