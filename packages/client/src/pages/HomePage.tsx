import { PageFrame } from '~/components/domain/PageFrame';
import { Notice } from '~/components/ui/Notice';
import { HomeCategoryBoard } from '~/features/home/HomeCategoryBoard';
import { HomeCategoryCreateForm } from '~/features/home/HomeCategoryCreateForm';
import { HomePageDialogs } from '~/features/home/HomePageDialogs';
import { HomeSampleImageInput } from '~/features/home/HomeSampleImageInput';
import { useHomePageController } from '~/features/home/use-home-page-controller';

export const HomePage = () => {
    const {
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
        setCategoryName,
        setRenameCategoryTarget,
        setRemoveCategoryTargetId,
        setRemoveKeywordTarget,
        handleCreateCategory,
        handleKeywordDragEnd,
        handleCopyAllKeywords,
        handleRenameCategoryRequest,
        handleRenameCategoryConfirm,
        handleRemoveCategoryRequest,
        handleRemoveCategoryConfirm,
        handleAddKeywords,
        handleCopyKeyword,
        handleViewCollection,
        handleRemoveKeywordRequest,
        handleRemoveKeywordConfirm,
        handleAddKeywordSampleImageRequest,
        handleSampleImageChange,
        handleRemoveKeywordSampleImage,
        reorderCategory,
    } = useHomePageController();
    const keywordCount = categories.reduce(
        (count, category) => count + category.keywords.length,
        0,
    );

    return (
        <PageFrame>
            <section className="mb-4 border-b border-line pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                            Prompt Palette
                        </h1>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink-subtle">
                            <span>{categories.length} categories</span>
                            <span aria-hidden="true">/</span>
                            <span>{keywordCount} keywords</span>
                            {saving ? (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <span>Saving</span>
                                </>
                            ) : null}
                        </p>
                    </div>

                    <HomeCategoryCreateForm
                        value={categoryName}
                        saving={saving}
                        onValueChange={setCategoryName}
                        onSubmit={handleCreateCategory}
                    />
                </div>
            </section>

            {loading ? (
                <Notice variant="neutral">Loading categories...</Notice>
            ) : null}

            {!loading && categories.length === 0 ? (
                <Notice variant="neutral" className="mb-4">
                    No categories yet. Add your first category to start
                    organizing prompts.
                </Notice>
            ) : null}

            <HomeCategoryBoard
                categories={categories}
                saving={saving}
                onReorderCategory={(activeCategoryId, overCategoryId) => {
                    void reorderCategory(activeCategoryId, overCategoryId);
                }}
                onKeywordDragEnd={handleKeywordDragEnd}
                onCopyAllKeywords={handleCopyAllKeywords}
                onRenameCategory={handleRenameCategoryRequest}
                onRemoveCategory={handleRemoveCategoryRequest}
                onAddKeywords={handleAddKeywords}
                onCopyKeyword={handleCopyKeyword}
                onViewCollection={handleViewCollection}
                onRemoveKeyword={handleRemoveKeywordRequest}
                onAddKeywordSampleImage={handleAddKeywordSampleImageRequest}
                onRemoveKeywordSampleImage={handleRemoveKeywordSampleImage}
            />

            <HomeSampleImageInput
                inputRef={sampleImageInputRef}
                onChange={handleSampleImageChange}
            />

            <HomePageDialogs
                renameCategoryTarget={renameCategoryTarget}
                removeCategoryTargetId={removeCategoryTargetId}
                removeCategoryTarget={removeCategoryTarget}
                removeKeywordTarget={removeKeywordTarget}
                removeKeywordName={removeKeywordName}
                onRenameCategoryConfirm={handleRenameCategoryConfirm}
                onCloseRenameDialog={() => {
                    setRenameCategoryTarget(null);
                }}
                onRemoveCategoryConfirm={handleRemoveCategoryConfirm}
                onCloseRemoveCategoryDialog={() => {
                    setRemoveCategoryTargetId(null);
                }}
                onRemoveKeywordConfirm={handleRemoveKeywordConfirm}
                onCloseRemoveKeywordDialog={() => {
                    setRemoveKeywordTarget(null);
                }}
            />
        </PageFrame>
    );
};
