import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import { GeneratedMetadataPanel } from '~/components/domain/GeneratedMetadataPanel';
import { PageFrame } from '~/components/domain/PageFrame';
import { PromptTextField } from '~/components/domain/PromptTextField';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { FileInput } from '~/components/ui/FileInput';
import { Notice } from '~/components/ui/Notice';
import { PromptDialog } from '~/components/ui/PromptDialog';
import { useClipboardToast } from '~/components/ui/use-clipboard-toast';
import { useImageLoad } from '~/features/image-load/use-image-load';
import { HeartIcon } from '~/icons';
import { formatDateTime } from '~/modules/date-time';

export const ImageLoadPage = () => {
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const { copyToClipboard } = useClipboardToast();

    const {
        loading,
        error,
        parsedPrompt,
        uploadedImage,
        selectedFileModifiedAt,
        savedCollectionId,
        onFile,
        saveToCollection,
    } = useImageLoad();

    const canSaveToCollection = Boolean(
        parsedPrompt && (parsedPrompt.prompt || parsedPrompt.negativePrompt),
    );
    const metadataRows = parsedPrompt
        ? [
              { label: 'Source Type', value: parsedPrompt.sourceType },
              { label: 'Model', value: parsedPrompt.model },
              { label: 'Model Hash', value: parsedPrompt.modelHash },
              { label: 'Base Sampler', value: parsedPrompt.baseSampler },
              { label: 'Base Scheduler', value: parsedPrompt.baseScheduler },
              {
                  label: 'Base Steps',
                  value: parsedPrompt.baseSteps?.toString(),
              },
              {
                  label: 'Base CFG',
                  value: parsedPrompt.baseCfgScale?.toString(),
              },
              { label: 'Base Seed', value: parsedPrompt.baseSeed },
              { label: 'Upscale Sampler', value: parsedPrompt.upscaleSampler },
              {
                  label: 'Upscale Scheduler',
                  value: parsedPrompt.upscaleScheduler,
              },
              {
                  label: 'Upscale Steps',
                  value: parsedPrompt.upscaleSteps?.toString(),
              },
              {
                  label: 'Upscale CFG',
                  value: parsedPrompt.upscaleCfgScale?.toString(),
              },
              { label: 'Upscale Seed', value: parsedPrompt.upscaleSeed },
              {
                  label: 'Upscale Factor',
                  value: parsedPrompt.upscaleFactor?.toString(),
              },
              { label: 'Upscaler', value: parsedPrompt.upscaler },
              {
                  label: 'Size',
                  value:
                      parsedPrompt.sizeWidth && parsedPrompt.sizeHeight
                          ? `${parsedPrompt.sizeWidth} x ${parsedPrompt.sizeHeight}`
                          : undefined,
              },
              { label: 'Clip Skip', value: parsedPrompt.clipSkip?.toString() },
              { label: 'VAE', value: parsedPrompt.vae },
              {
                  label: 'Denoise Strength',
                  value: parsedPrompt.denoiseStrength?.toString(),
              },
              {
                  label: 'File Modified (Local)',
                  value: formatDateTime(selectedFileModifiedAt || undefined),
              },
              {
                  label: 'Generated At',
                  value: formatDateTime(
                      uploadedImage?.generatedAt || undefined,
                  ),
              },
              { label: 'Parse Version', value: parsedPrompt.parseVersion },
          ].filter((item) => Boolean(item.value))
        : [];
    const statusLabel = loading
        ? 'Reading image'
        : parsedPrompt
          ? `${metadataRows.length} metadata fields`
          : 'No prompt loaded';

    return (
        <PageFrame>
            <section className="mb-4 border-b border-line pb-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                        Prompt Info
                    </h1>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <FileInput
                        accept="image/png,image/jpeg,image/webp"
                        disabled={loading}
                        title="Source Image"
                        chooseLabel="Choose Image"
                        helperText="PNG, JPG, WEBP"
                        onSelect={(file) => {
                            void onFile(file);
                        }}
                    />

                    {error ? <Notice variant="error">{error}</Notice> : null}
                </div>

                <div className="space-y-4">
                    <Card
                        padding="none"
                        className="min-h-[520px] overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-ink">
                                    Parsed Prompt
                                </h2>
                                <p className="mt-1 text-xs font-medium text-ink-subtle">
                                    {statusLabel}
                                </p>
                            </div>

                            {parsedPrompt ? (
                                <Button
                                    variant="control"
                                    size="control"
                                    onClick={() => setSaveDialogOpen(true)}
                                    disabled={loading || !canSaveToCollection}
                                >
                                    <HeartIcon
                                        width={14}
                                        height={14}
                                        className="fill-danger-700 text-danger-700"
                                    />
                                    Save to Collection
                                </Button>
                            ) : null}
                        </div>

                        <div className="p-4">
                            {parsedPrompt ? (
                                <div className="space-y-4">
                                    <PromptTextField
                                        title="Prompt"
                                        value={parsedPrompt.prompt}
                                        rows={8}
                                        size="detail"
                                        labelStyle="title"
                                        emptyValue="No prompt found in metadata."
                                        onCopy={() => {
                                            void copyToClipboard(
                                                parsedPrompt.prompt,
                                                {
                                                    label: 'Prompt',
                                                },
                                            );
                                        }}
                                    />

                                    <PromptTextField
                                        title="Negative Prompt"
                                        value={parsedPrompt.negativePrompt}
                                        rows={8}
                                        size="detail"
                                        labelStyle="title"
                                        surface="muted"
                                        emptyValue="No negative prompt found in metadata."
                                        onCopy={() => {
                                            void copyToClipboard(
                                                parsedPrompt.negativePrompt,
                                                { label: 'Negative prompt' },
                                            );
                                        }}
                                    />

                                    <div className="border-t border-line pt-4">
                                        <GeneratedMetadataPanel
                                            rows={metadataRows}
                                            emptyMessage="No structured metadata fields were found."
                                            warnings={
                                                parsedPrompt.parseWarnings
                                            }
                                            note={
                                                uploadedImage
                                                    ? null
                                                    : 'Generated timestamp appears after saving to collection.'
                                            }
                                            onCopyJson={() => {
                                                void copyToClipboard(
                                                    JSON.stringify(
                                                        parsedPrompt,
                                                        null,
                                                        2,
                                                    ),
                                                    { label: 'Metadata JSON' },
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid min-h-[380px] place-items-center">
                                    <p className="text-sm text-ink-subtle">
                                        No prompt loaded
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {savedCollectionId ? (
                        <Notice variant="success">
                            Saved to collection #{savedCollectionId}.{' '}
                            <Link
                                to="/collection/$id"
                                params={{ id: String(savedCollectionId) }}
                                className="underline"
                            >
                                Open detail
                            </Link>
                        </Notice>
                    ) : null}
                </div>
            </div>

            <PromptDialog
                open={saveDialogOpen}
                title="Save Prompt to Collection"
                description="Enter a collection title for this Stable Diffusion prompt."
                placeholder="Collection title"
                confirmLabel="Save"
                submitting={loading}
                onSubmit={(title) => {
                    void saveToCollection(title);
                    setSaveDialogOpen(false);
                }}
                onOpenChange={setSaveDialogOpen}
            />
        </PageFrame>
    );
};
