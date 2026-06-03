import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

import { useToast } from '~/components/ui/ToastProvider';
import { useClipboardToast } from '~/components/ui/use-clipboard-toast';
import type { KeywordFieldsInput } from '~/features/keyword/api';
import { parseKeywordSortableId } from '~/features/home/dnd-ids';
import { useHomeSampleImageActions } from '~/features/home/use-home-sample-image-actions';
import type { HomeCategory } from '~/features/home/types';
import { useHomeBoard } from '~/features/home/use-home-board';
import type { Keyword } from '~/models/types';

interface KeywordRemoveTarget {
    categoryId: number;
    keywordId: number;
}

interface KeywordDetailsTarget {
    categoryId: number;
    keyword: Keyword | null;
}

export const useHomePageController = () => {
    const navigate = useNavigate();
    const { pushToast } = useToast();
    const { copyToClipboard } = useClipboardToast();

    const [categoryName, setCategoryName] = useState('');
    const [renameCategoryTarget, setRenameCategoryTarget] =
        useState<HomeCategory | null>(null);
    const [removeCategoryTargetId, setRemoveCategoryTargetId] = useState<
        number | null
    >(null);
    const [removeKeywordTarget, setRemoveKeywordTarget] =
        useState<KeywordRemoveTarget | null>(null);
    const [keywordDetailsTarget, setKeywordDetailsTarget] =
        useState<KeywordDetailsTarget | null>(null);
    const lastErrorRef = useRef<string | null>(null);

    const {
        categories,
        loading,
        saving,
        error,
        reorderCategory,
        reorderKeyword,
        createCategoryByName,
        renameCategory,
        removeCategory,
        addKeywords,
        addKeywordWithFields,
        editKeyword,
        removeKeyword,
        addKeywordSampleImage,
        removeKeywordSampleImage,
    } = useHomeBoard();
    const {
        sampleImageInputRef,
        handleAddKeywordSampleImageRequest,
        handleSampleImageChange,
        handleRemoveKeywordSampleImage,
    } = useHomeSampleImageActions({
        addKeywordSampleImage,
        removeKeywordSampleImage,
        onSuccessToast: (message) => {
            pushToast({
                message,
                variant: 'success',
            });
        },
    });

    useEffect(() => {
        if (!error) {
            lastErrorRef.current = null;
            return;
        }
        if (lastErrorRef.current === error) {
            return;
        }
        pushToast({
            message: error,
            variant: 'error',
        });
        lastErrorRef.current = error;
    }, [error, pushToast]);

    const removeCategoryTarget = useMemo(
        () =>
            categories.find(
                (category) => category.id === removeCategoryTargetId,
            ) ?? null,
        [categories, removeCategoryTargetId],
    );

    const removeKeywordName = useMemo(() => {
        if (!removeKeywordTarget) {
            return null;
        }

        const targetCategory = categories.find(
            (category) => category.id === removeKeywordTarget.categoryId,
        );
        const targetKeyword = targetCategory?.keywords.find(
            (keyword) => keyword.id === removeKeywordTarget.keywordId,
        );
        return targetKeyword?.name ?? null;
    }, [categories, removeKeywordTarget]);

    const keywordDetailsCategory = useMemo(() => {
        if (!keywordDetailsTarget) {
            return null;
        }

        return (
            categories.find(
                (category) => category.id === keywordDetailsTarget.categoryId,
            ) ?? null
        );
    }, [categories, keywordDetailsTarget]);

    const handleKeywordDragEnd = useCallback(
        (categoryId: number, event: DragEndEvent) => {
            if (!event.over) {
                return;
            }

            const activeKeyword = parseKeywordSortableId(event.active.id);
            const overKeyword = parseKeywordSortableId(event.over.id);

            if (!activeKeyword || !overKeyword) {
                return;
            }

            if (
                activeKeyword.categoryId !== categoryId ||
                overKeyword.categoryId !== categoryId
            ) {
                return;
            }

            void reorderKeyword(
                categoryId,
                activeKeyword.keywordId,
                overKeyword.keywordId,
            );
        },
        [reorderKeyword],
    );

    const copyText = useCallback(
        async (text: string, feedbackLabel = 'Keyword') => {
            await copyToClipboard(text, { label: feedbackLabel });
        },
        [copyToClipboard],
    );

    const handleCreateCategory = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const trimmedName = categoryName.trim();
            if (!trimmedName) {
                return;
            }

            const created = await createCategoryByName(trimmedName);
            if (created) {
                setCategoryName('');
                pushToast({
                    message: 'Category added',
                    variant: 'success',
                });
            }
        },
        [categoryName, createCategoryByName, pushToast],
    );

    const handleCopyAllKeywords = useCallback(
        (category: HomeCategory) => {
            const keywordText = category.keywords
                .map((keyword) => keyword.name)
                .join(', ');
            if (!keywordText) {
                return;
            }
            void copyText(keywordText, `${category.name} list`);
        },
        [copyText],
    );

    const handleRenameCategoryRequest = useCallback(
        (category: HomeCategory) => {
            setRenameCategoryTarget(category);
        },
        [],
    );

    const handleRenameCategoryConfirm = useCallback(
        (nextName: string) => {
            if (!renameCategoryTarget) {
                return;
            }

            void (async () => {
                const renamed = await renameCategory(
                    renameCategoryTarget.id,
                    nextName,
                );
                if (!renamed) {
                    return;
                }
                pushToast({
                    message: 'Category renamed',
                    variant: 'success',
                });
                setRenameCategoryTarget(null);
            })();
        },
        [pushToast, renameCategory, renameCategoryTarget],
    );

    const handleRemoveCategoryRequest = useCallback((categoryId: number) => {
        setRemoveCategoryTargetId(categoryId);
    }, []);

    const handleRemoveCategoryConfirm = useCallback(() => {
        if (!removeCategoryTargetId) {
            return;
        }

        void (async () => {
            const removed = await removeCategory(removeCategoryTargetId);
            if (!removed) {
                return;
            }
            pushToast({
                message: 'Category removed',
                variant: 'success',
            });
            setRemoveCategoryTargetId(null);
        })();
    }, [pushToast, removeCategory, removeCategoryTargetId]);

    const handleAddKeywords = useCallback(
        async (categoryId: number, rawKeywords: string) => {
            const added = await addKeywords(categoryId, rawKeywords);
            if (added) {
                pushToast({
                    message: 'Keyword added',
                    variant: 'success',
                });
            }
            return added;
        },
        [addKeywords, pushToast],
    );

    const handleAddKeywordDetailsRequest = useCallback((categoryId: number) => {
        setKeywordDetailsTarget({ categoryId, keyword: null });
    }, []);

    const handleEditKeywordRequest = useCallback(
        (categoryId: number, keyword: Keyword) => {
            setKeywordDetailsTarget({ categoryId, keyword });
        },
        [],
    );

    const handleKeywordDetailsConfirm = useCallback(
        (values: KeywordFieldsInput) => {
            if (!keywordDetailsTarget) {
                return;
            }

            void (async () => {
                const saved = keywordDetailsTarget.keyword
                    ? await editKeyword(keywordDetailsTarget.keyword.id, values)
                    : await addKeywordWithFields(
                          keywordDetailsTarget.categoryId,
                          values,
                      );

                if (!saved) {
                    return;
                }

                pushToast({
                    message: keywordDetailsTarget.keyword
                        ? 'Keyword updated'
                        : 'Keyword added',
                    variant: 'success',
                });
                setKeywordDetailsTarget(null);
            })();
        },
        [addKeywordWithFields, editKeyword, keywordDetailsTarget, pushToast],
    );

    const handleCopyKeyword = useCallback(
        (keywordName: string) => {
            void copyText(keywordName);
        },
        [copyText],
    );

    const handleViewCollection = useCallback(
        (keywordName: string) => {
            void navigate({
                to: '/collection',
                search: { query: keywordName, searchBy: 'prompt' },
            });
        },
        [navigate],
    );

    const handleRemoveKeywordRequest = useCallback(
        (categoryId: number, keywordId: number) => {
            setRemoveKeywordTarget({ categoryId, keywordId });
        },
        [],
    );

    const handleRemoveKeywordConfirm = useCallback(() => {
        if (!removeKeywordTarget) {
            return;
        }

        void (async () => {
            const removed = await removeKeyword(
                removeKeywordTarget.categoryId,
                removeKeywordTarget.keywordId,
            );
            if (!removed) {
                return;
            }
            pushToast({
                message: 'Keyword removed',
                variant: 'success',
            });
            setRemoveKeywordTarget(null);
        })();
    }, [pushToast, removeKeyword, removeKeywordTarget]);

    return {
        categoryName,
        categories,
        loading,
        saving,
        sampleImageInputRef,
        renameCategoryTarget,
        removeCategoryTargetId,
        removeCategoryTarget,
        removeKeywordTarget,
        removeKeywordName,
        keywordDetailsTarget,
        keywordDetailsCategory,
        setCategoryName,
        setRenameCategoryTarget,
        setRemoveCategoryTargetId,
        setRemoveKeywordTarget,
        setKeywordDetailsTarget,
        handleCreateCategory,
        handleKeywordDragEnd,
        handleCopyAllKeywords,
        handleRenameCategoryRequest,
        handleRenameCategoryConfirm,
        handleRemoveCategoryRequest,
        handleRemoveCategoryConfirm,
        handleAddKeywords,
        handleAddKeywordDetailsRequest,
        handleEditKeywordRequest,
        handleKeywordDetailsConfirm,
        handleCopyKeyword,
        handleViewCollection,
        handleRemoveKeywordRequest,
        handleRemoveKeywordConfirm,
        handleAddKeywordSampleImageRequest,
        handleSampleImageChange,
        handleRemoveKeywordSampleImage,
        reorderCategory,
    };
};
