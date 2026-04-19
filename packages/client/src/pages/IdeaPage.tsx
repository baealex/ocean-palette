import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { getCategories } from '~/api';
import { Checkbox } from '~/components/ui/Checkbox';
import { KeywordsList } from '~/components/domain/KeywordsList';
import { PageFrame } from '~/components/domain/PageFrame';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Input } from '~/components/ui/Input';
import { Notice } from '~/components/ui/Notice';
import { useClipboardToast } from '~/components/ui/use-clipboard-toast';
import type { Category, Keyword } from '~/models/types';
import { useMemoState } from '~/modules/memo';

export const IdeaPage = () => {
    const { copyToClipboard } = useClipboardToast();
    const [generatedKeywords, setMemoKeywords] = useMemoState<Keyword[]>(
        ['idea', 'generated', 'keywords'],
        [],
        { storage: 'session' },
    );
    const [selected, setMemoSelected] = useMemoState<number[]>(
        ['idea', 'selected'],
        [],
        { storage: 'session' },
    );

    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [keywords, setKeywords] = useState<Keyword[]>(generatedKeywords);
    const [selectedIds, setSelectedIds] = useState<number[]>(
        selected
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value > 0),
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(
        categoryList.length === 0,
    );
    const [categoryQuery, setCategoryQuery] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await getCategories();
                if (cancelled) {
                    return;
                }

                const nextCategories = response.data.allCategories;
                setCategoryList(nextCategories);
                setSelectedIds((prev) => {
                    if (prev.length === 0) {
                        return nextCategories.map((category) => category.id);
                    }

                    const validSelection = prev.filter((categoryId) =>
                        nextCategories.some(
                            (category) => category.id === categoryId,
                        ),
                    );

                    return validSelection.length > 0
                        ? validSelection
                        : nextCategories.map((category) => category.id);
                });
            } catch (nextError) {
                if (cancelled) {
                    return;
                }
                setError(
                    nextError instanceof Error
                        ? nextError.message
                        : 'Failed to load categories',
                );
            } finally {
                if (!cancelled) {
                    setIsLoadingCategories(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setMemoKeywords(keywords);
        setMemoSelected(selectedIds);
    }, [keywords, selectedIds, setMemoKeywords, setMemoSelected]);

    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();

    const visibleCategories = useMemo(() => {
        if (normalizedCategoryQuery.length === 0) {
            return categoryList;
        }

        return categoryList.filter((category) =>
            category.name.toLowerCase().includes(normalizedCategoryQuery),
        );
    }, [categoryList, normalizedCategoryQuery]);

    const selectedCount = useMemo(() => {
        return categoryList.reduce(
            (count, category) =>
                selectedIdSet.has(category.id) ? count + 1 : count,
            0,
        );
    }, [categoryList, selectedIdSet]);

    const isAllSelected =
        categoryList.length > 0 && selectedCount === categoryList.length;
    const canGenerate =
        selectedCount > 0 && categoryList.length > 0 && !isLoadingCategories;
    const generatedText = useMemo(
        () => keywords.map((keyword) => keyword.name).join(', '),
        [keywords],
    );

    const handleCheckboxChange = (nextChecked: boolean, name: string) => {
        const categoryId = Number(name);
        if (!Number.isFinite(categoryId) || categoryId <= 0) {
            return;
        }

        setSelectedIds((prev) => {
            if (nextChecked) {
                if (prev.includes(categoryId)) {
                    return prev;
                }
                return [...prev, categoryId];
            }

            return prev.filter((value) => value !== categoryId);
        });
    };

    const handleSelectAll = () => {
        setSelectedIds(categoryList.map((category) => category.id));
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
    };

    const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canGenerate) {
            return;
        }

        const nextKeywords = categoryList
            .filter((category) => selectedIdSet.has(category.id))
            .map((category) => {
                if (category.keywords.length === 0) {
                    return null;
                }

                const randomIndex = Math.floor(
                    Math.random() * category.keywords.length,
                );
                return category.keywords[randomIndex];
            })
            .filter((keyword): keyword is Keyword => keyword !== null);

        setKeywords(nextKeywords);
    };

    return (
        <PageFrame>
            <section className="mb-4 border-b border-line pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                            Idea Mixer
                        </h1>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
                <Card
                    padding="none"
                    className="h-fit overflow-hidden xl:sticky xl:top-20"
                >
                    <form onSubmit={handleGenerate} className="flex flex-col">
                        <div className="border-b border-line p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-ink">
                                        Categories
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-ink-subtle">
                                        {selectedCount}/{categoryList.length}{' '}
                                        selected
                                    </p>
                                </div>
                            </div>

                            <Input
                                value={categoryQuery}
                                onChange={(event) =>
                                    setCategoryQuery(event.target.value)
                                }
                                placeholder="Filter categories"
                                aria-label="Filter categories"
                                inputSize="control"
                                tone="control"
                                className="mt-3"
                            />

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="control"
                                    size="control"
                                    disabled={
                                        categoryList.length === 0 ||
                                        isAllSelected
                                    }
                                    onClick={handleSelectAll}
                                >
                                    Select all
                                </Button>
                                <Button
                                    type="button"
                                    variant="text"
                                    size="control"
                                    disabled={selectedCount === 0}
                                    onClick={handleClearSelection}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <div className="flex max-h-[420px] min-h-[220px] flex-col gap-2 overflow-auto p-3">
                            {isLoadingCategories ? (
                                <Notice variant="neutral">
                                    Loading categories...
                                </Notice>
                            ) : null}

                            {!isLoadingCategories &&
                            categoryList.length === 0 ? (
                                <Notice variant="warning">
                                    No categories are available yet.
                                </Notice>
                            ) : null}

                            {!isLoadingCategories &&
                            categoryList.length > 0 &&
                            visibleCategories.length === 0 ? (
                                <Notice variant="neutral">
                                    No categories match this filter.
                                </Notice>
                            ) : null}

                            {visibleCategories.map((category) => (
                                <Checkbox
                                    key={category.id}
                                    name={String(category.id)}
                                    label={category.name}
                                    checked={selectedIdSet.has(category.id)}
                                    meta={`${category.keywords.length} keywords`}
                                    onChange={handleCheckboxChange}
                                />
                            ))}
                        </div>

                        <div className="border-t border-line bg-surface-muted/45 p-3">
                            <Button
                                type="submit"
                                variant="primary"
                                size="control"
                                className="w-full"
                                disabled={!canGenerate}
                            >
                                {canGenerate
                                    ? 'Generate ideas'
                                    : 'Select categories first'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card padding="none" className="min-h-[420px] overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-line p-3">
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-ink">
                                Generated Set
                            </h2>
                            <p className="mt-1 text-xs font-medium text-ink-subtle">
                                {keywords.length} keywords
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="text"
                            size="compact"
                            disabled={keywords.length === 0}
                            onClick={() => {
                                void copyToClipboard(generatedText, {
                                    label: 'Generated list',
                                });
                            }}
                        >
                            Copy all
                        </Button>
                    </div>

                    <div className="p-4">
                        {keywords.length > 0 ? (
                            <KeywordsList
                                keywords={keywords}
                                className="mb-0"
                                onClick={(keyword) => {
                                    void copyToClipboard(keyword.name, {
                                        label: 'Keyword',
                                    });
                                }}
                            />
                        ) : (
                            <div className="grid min-h-[280px] place-items-center">
                                <Notice variant="neutral" className="max-w-md">
                                    No generated set yet.
                                </Notice>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {error ? (
                <Notice variant="error" className="mt-4">
                    {error}
                </Notice>
            ) : null}
        </PageFrame>
    );
};
