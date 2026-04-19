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

    return (
        <PageFrame
            title="Stable Diffusion Prompt Info"
            description="Load PNG/JPG/WEBP files to read generation metadata and save it to collection."
        >
            <div className="grid gap-4 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <FileInput
                        accept="image/png,image/jpeg,image/webp"
                        disabled={loading}
                        helperText="Select an image file to extract prompt metadata and preview before saving."
                        onSelect={(file) => {
                            void onFile(file);
                        }}
                    />

                    <section className="rounded-token-md border border-brand-200 bg-brand-50/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                            Next Step
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                            Create a collection item from parsed prompt
                            metadata.
                        </p>
                        <Button
                            variant="primary"
                            className="mt-3 w-full"
                            onClick={() => setSaveDialogOpen(true)}
                            disabled={loading || !canSaveToCollection}
                        >
                            <HeartIcon width={14} height={14} />
                            Save Prompt to Collection
                        </Button>
                    </section>
                </div>

                <div className="space-y-4">
                    {parsedPrompt ? (
                        <Card className="space-y-4 text-sm text-ink-muted">
                            <PromptTextField
                                title="Prompt"
                                value={parsedPrompt.prompt}
                                rows={8}
                                size="detail"
                                labelStyle="title"
                                copyTone="control"
                                emptyValue="No prompt found in metadata."
                                onCopy={() => {
                                    void copyToClipboard(parsedPrompt.prompt, {
                                        label: 'Prompt',
                                    });
                                }}
                            />

                            <PromptTextField
                                title="Negative Prompt"
                                value={parsedPrompt.negativePrompt}
                                rows={5}
                                size="detail"
                                labelStyle="title"
                                copyTone="control"
                                muted
                                emptyValue="No negative prompt found in metadata."
                                onCopy={() => {
                                    void copyToClipboard(
                                        parsedPrompt.negativePrompt,
                                        { label: 'Negative prompt' },
                                    );
                                }}
                            />

                            <GeneratedMetadataPanel
                                rows={metadataRows}
                                emptyMessage="No structured metadata fields were found."
                                warnings={parsedPrompt.parseWarnings}
                                note={
                                    uploadedImage
                                        ? null
                                        : 'Generated timestamp appears after saving to collection.'
                                }
                                onCopyJson={() => {
                                    void copyToClipboard(
                                        JSON.stringify(parsedPrompt, null, 2),
                                        { label: 'Metadata JSON' },
                                    );
                                }}
                            />
                        </Card>
                    ) : (
                        <Card tone="muted" className="text-sm text-ink-muted">
                            <p className="text-ink-muted">
                                Prompt metadata will appear here after you
                                select an image.
                            </p>
                        </Card>
                    )}

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

                    {error ? <Notice variant="error">{error}</Notice> : null}
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
