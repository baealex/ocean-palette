import { CollectionFilterBar } from '~/components/domain/CollectionFilterBar';
import { CollectionNav } from '~/components/domain/CollectionNav';
import { CollectionRealtimeControl } from '~/components/domain/CollectionRealtimeControl';
import { CollectionSearchBar } from '~/components/domain/CollectionSearchBar';
import { CollectionShowcaseShortcut } from '~/components/domain/CollectionShowcaseShortcut';
import { PageFrame } from '~/components/domain/PageFrame';
import {
    DEFAULT_COLLECTION_DATE_FIELD,
    DEFAULT_COLLECTION_SEARCH_BY,
    DEFAULT_COLLECTION_SORT,
} from '~/features/collection/view-filter';
import { useCollectionPageContent } from '~/features/collection/use-collection-page-content';
import { useCollectionPageData } from '~/features/collection/use-collection-page-data';
import { useCollectionPageFilters } from '~/features/collection/use-collection-page-filters';
import { useCollectionPagePaginationSync } from '~/features/collection/use-collection-page-pagination-sync';

const COLLECTION_PAGE_META = {
    title: 'Collection',
    searchPlaceholder: 'Search collections',
} as const;

export const CollectionPage = () => {
    const {
        searchState,
        draftQuery,
        draftModel,
        setDraftQuery,
        applySearch,
        handleSortChange,
        handleModelChange,
        handleSearchByChange,
        handleDateFieldChange,
        handleDateFromChange,
        handleDateToChange,
        handleDateRangeChange,
        handleDateQuickPreset,
        handleViewChange,
        handlePageChange,
        handleBrowseSelectedChange,
        resetFilters,
    } = useCollectionPageFilters();

    const {
        query,
        model,
        searchBy,
        dateField,
        dateFrom,
        dateTo,
        sort,
        view,
        page: currentPage,
        selected: selectedId,
    } = searchState;

    const {
        modelOptionsQuery,
        modelOptions,
        modelOptionsError,
        collectionsQuery,
        items,
        loading,
        totalPages,
        totalItems,
        queryErrorMessage,
        refreshCollections,
    } = useCollectionPageData({
        query,
        model,
        searchBy,
        dateField,
        dateFrom,
        dateTo,
        sort,
        currentPage,
    });

    useCollectionPagePaginationSync({
        currentPage,
        lastPage: collectionsQuery.data?.lastPage,
        onPageChange: handlePageChange,
    });

    const content = useCollectionPageContent({
        view,
        items,
        loading,
        currentPage,
        totalPages,
        totalItems,
        selectedId,
        queryErrorMessage,
        onPageChange: handlePageChange,
        onSelectedChange: handleBrowseSelectedChange,
        onRefresh: refreshCollections,
    });
    const canResetFilters =
        draftQuery.trim().length > 0 ||
        draftModel.length > 0 ||
        searchBy !== DEFAULT_COLLECTION_SEARCH_BY ||
        sort !== DEFAULT_COLLECTION_SORT ||
        dateFrom.length > 0 ||
        dateTo.length > 0 ||
        dateField !== DEFAULT_COLLECTION_DATE_FIELD;

    return (
        <PageFrame title={COLLECTION_PAGE_META.title}>
            <section
                aria-label="Collection search and filters"
                className="mb-3 overflow-hidden rounded-token-lg border border-line/80 bg-surface-base/95"
            >
                <div className="p-3">
                    <CollectionSearchBar
                        value={draftQuery}
                        searchBy={searchBy}
                        canReset={canResetFilters}
                        onChange={setDraftQuery}
                        onSearchByChange={handleSearchByChange}
                        onSubmit={applySearch}
                        onReset={resetFilters}
                        placeholder={COLLECTION_PAGE_META.searchPlaceholder}
                        embedded
                    />
                </div>
                <CollectionFilterBar
                    sort={sort}
                    model={draftModel}
                    dateField={dateField}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    modelOptions={modelOptions}
                    loadingModelOptions={modelOptionsQuery.isPending}
                    modelOptionsError={modelOptionsError}
                    onSortChange={handleSortChange}
                    onModelChange={handleModelChange}
                    onDateFieldChange={handleDateFieldChange}
                    onDateFromChange={handleDateFromChange}
                    onDateToChange={handleDateToChange}
                    onDateRangeChange={handleDateRangeChange}
                    onDateQuickPreset={handleDateQuickPreset}
                    embedded
                />
            </section>
            <div className="mb-3">
                <CollectionRealtimeControl />
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
                <CollectionNav view={view} onViewChange={handleViewChange} />
                <CollectionShowcaseShortcut />
            </div>

            {content}
        </PageFrame>
    );
};
