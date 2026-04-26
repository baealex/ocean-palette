import type { Collection } from '~/models/types';
import { Button } from '~/components/ui/Button';
import { formatDateTime } from '~/modules/date-time';

import { Image } from '~/components/ui/Image';
import { GeneratedMetadataPanel } from './GeneratedMetadataPanel';
import { PromptTextField } from './PromptTextField';

interface CollectionDetailCardProps {
    collection: Collection;
    onClickCopy: (text: string, label?: string) => void;
    onClickRename: () => void;
    onClickDelete: () => void;
    renaming?: boolean;
    removing?: boolean;
}

export const CollectionDetailCard = ({
    collection,
    onClickCopy,
    onClickRename,
    onClickDelete,
    renaming = false,
    removing = false,
}: CollectionDetailCardProps) => {
    const generatedMetadata = collection.generatedMetadata || null;
    const generatedAt = formatDateTime(collection.generatedAt || undefined);
    const metadataRows = generatedMetadata
        ? [
              { label: 'Source Type', value: generatedMetadata.sourceType },
              { label: 'Model', value: generatedMetadata.model },
              { label: 'Model Hash', value: generatedMetadata.modelHash },
              { label: 'Base Sampler', value: generatedMetadata.baseSampler },
              {
                  label: 'Base Scheduler',
                  value: generatedMetadata.baseScheduler,
              },
              {
                  label: 'Base Steps',
                  value: generatedMetadata.baseSteps?.toString(),
              },
              {
                  label: 'Base CFG',
                  value: generatedMetadata.baseCfgScale?.toString(),
              },
              { label: 'Base Seed', value: generatedMetadata.baseSeed },
              {
                  label: 'Upscale Sampler',
                  value: generatedMetadata.upscaleSampler,
              },
              {
                  label: 'Upscale Scheduler',
                  value: generatedMetadata.upscaleScheduler,
              },
              {
                  label: 'Upscale Steps',
                  value: generatedMetadata.upscaleSteps?.toString(),
              },
              {
                  label: 'Upscale CFG',
                  value: generatedMetadata.upscaleCfgScale?.toString(),
              },
              { label: 'Upscale Seed', value: generatedMetadata.upscaleSeed },
              {
                  label: 'Upscale Factor',
                  value: generatedMetadata.upscaleFactor?.toString(),
              },
              { label: 'Upscaler', value: generatedMetadata.upscaler },
              {
                  label: 'Size',
                  value:
                      generatedMetadata.sizeWidth &&
                      generatedMetadata.sizeHeight
                          ? `${generatedMetadata.sizeWidth} x ${generatedMetadata.sizeHeight}`
                          : undefined,
              },
              {
                  label: 'Clip Skip',
                  value: generatedMetadata.clipSkip?.toString(),
              },
              { label: 'VAE', value: generatedMetadata.vae },
              {
                  label: 'Denoise Strength',
                  value: generatedMetadata.denoiseStrength?.toString(),
              },
              { label: 'Parse Version', value: generatedMetadata.parseVersion },
          ].filter((item) => Boolean(item.value))
        : [];

    return (
        <article className="space-y-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-ink">
                        {collection.title || '(untitled)'}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
                        <span>Collection #{collection.id}</span>
                        <span>
                            {collection.image.width} x {collection.image.height}
                        </span>
                        <span>Generated At: {generatedAt || '-'}</span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="control"
                        size="sm"
                        onClick={onClickRename}
                        disabled={renaming}
                    >
                        {renaming ? 'Renaming...' : 'Rename'}
                    </Button>
                    <Button
                        variant="text"
                        size="sm"
                        className="text-red-700 hover:text-red-700"
                        onClick={onClickDelete}
                        disabled={removing}
                    >
                        {removing ? 'Removing...' : 'Remove'}
                    </Button>
                </div>
            </header>

            <section
                aria-label="Collection image"
                className="overflow-hidden rounded-token-lg bg-surface-muted"
            >
                <Image
                    className="mx-auto block h-auto max-h-[78vh] w-full object-contain"
                    alt={collection.title || 'Collection image'}
                    src={collection.image.url}
                    width={collection.image.width}
                    height={collection.image.height}
                />
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
                <section className="space-y-4">
                    <PromptTextField
                        title="Prompt"
                        value={collection.prompt}
                        rows={10}
                        size="detail"
                        labelStyle="title"
                        copyTone="control"
                        onCopy={() => {
                            onClickCopy(collection.prompt, 'Collection prompt');
                        }}
                    />

                    <PromptTextField
                        title="Negative Prompt"
                        value={collection.negativePrompt}
                        rows={6}
                        size="detail"
                        labelStyle="title"
                        copyTone="control"
                        muted
                        onCopy={() => {
                            onClickCopy(
                                collection.negativePrompt,
                                'Collection negative prompt',
                            );
                        }}
                    />
                </section>

                <aside className="space-y-4 border-t border-line pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
                    <GeneratedMetadataPanel
                        rows={metadataRows}
                        emptyMessage="No generated metadata saved for this image."
                        warnings={generatedMetadata?.parseWarnings}
                        onCopyJson={() => {
                            onClickCopy(
                                JSON.stringify(
                                    generatedMetadata || {},
                                    null,
                                    2,
                                ),
                                'Metadata JSON',
                            );
                        }}
                    />
                </aside>
            </div>
        </article>
    );
};
