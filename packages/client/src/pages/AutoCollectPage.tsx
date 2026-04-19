import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { AutoCollectDirectoryBrowserPanel } from '~/components/domain/AutoCollectDirectoryBrowserPanel';
import { PageFrame } from '~/components/domain/PageFrame';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { FieldChoice } from '~/components/ui/FieldChoice';
import { Input } from '~/components/ui/Input';
import { useToast } from '~/components/ui/ToastProvider';
import { useAutoCollectControl } from '~/features/collection/use-auto-collect-control';

export const AutoCollectPage = () => {
    const { pushToast } = useToast();
    const initializedBrowserRef = useRef(false);

    const {
        feedback,
        loadingConfig,
        collectingNow,
        statusSyncing,
        statusSyncReason,
        statusSyncScanned,
        statusSyncUpdatedAt,
        savingSettings,
        statusEnabled,
        draftWatchDir,
        draftIngestMode,
        draftDeleteSourceOnDelete,
        draftEnabled,
        normalizedDraftWatchDir,
        hasDraftChanges,
        directoryBrowserLoading,
        directoryCurrentPath,
        directoryParentPath,
        directoryRoots,
        directoryEntries,
        setDraftWatchDir,
        setDraftIngestMode,
        setDraftDeleteSourceOnDelete,
        setDraftEnabled,
        loadServerDirectories,
        handleOpenSettings,
        handleCollectNow,
        handleSaveSettings,
    } = useAutoCollectControl();

    const collecting = collectingNow || statusSyncing;
    const lastSyncTimeLabel =
        typeof statusSyncUpdatedAt === 'number'
            ? new Date(statusSyncUpdatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              })
            : null;
    const statusSummary = collecting
        ? `Syncing now${statusSyncReason ? ` (${statusSyncReason})` : ''}`
        : typeof statusSyncScanned === 'number'
          ? `Last sync scanned ${statusSyncScanned} file${statusSyncScanned === 1 ? '' : 's'}${lastSyncTimeLabel ? ` at ${lastSyncTimeLabel}` : ''}`
          : 'Watch a folder and import new images';

    useEffect(() => {
        if (!feedback) {
            return;
        }
        pushToast({
            variant: feedback.variant,
            message: feedback.message,
        });
    }, [feedback, pushToast]);

    useEffect(() => {
        if (loadingConfig || initializedBrowserRef.current) {
            return;
        }
        initializedBrowserRef.current = true;
        handleOpenSettings();
    }, [handleOpenSettings, loadingConfig]);

    return (
        <PageFrame>
            <section className="mb-4 border-b border-line pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                            Auto Collect
                        </h1>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink-subtle">
                            <span>
                                {statusEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <span aria-hidden="true">/</span>
                            <span>{statusSummary}</span>
                            {loadingConfig ? (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <span>Loading settings</span>
                                </>
                            ) : null}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            to="/collection"
                            className="ui-focus-ring inline-flex h-10 items-center justify-center rounded-token-md border border-line-strong bg-surface-base px-4 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-muted"
                        >
                            Back to Collection
                        </Link>
                        <Button
                            variant="control"
                            size="control"
                            onClick={() => {
                                void handleCollectNow();
                            }}
                            disabled={collecting || loadingConfig}
                        >
                            {collecting ? 'Collecting...' : 'Collect now'}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="grid min-h-[520px] grid-rows-[auto_minmax(0,1fr)] gap-3 md:min-h-[620px]">
                    <div className="rounded-token-md border border-line bg-surface-base p-3">
                        <label className="mb-1 block text-xs font-semibold text-ink-subtle">
                            Watch Folder
                        </label>
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <Input
                                value={draftWatchDir}
                                onChange={(event) =>
                                    setDraftWatchDir(event.target.value)
                                }
                                placeholder="C:\\path\\to\\watch"
                                inputSize="control"
                                tone="control"
                            />
                            <Button
                                variant="control"
                                size="control"
                                onClick={() => {
                                    void loadServerDirectories(
                                        normalizedDraftWatchDir || undefined,
                                    );
                                }}
                                disabled={!normalizedDraftWatchDir}
                            >
                                Open Path
                            </Button>
                        </div>
                    </div>

                    <div className="min-h-0 overflow-hidden">
                        <AutoCollectDirectoryBrowserPanel
                            loading={directoryBrowserLoading}
                            currentPath={directoryCurrentPath}
                            parentPath={directoryParentPath}
                            roots={directoryRoots}
                            entries={directoryEntries}
                            watchPath={normalizedDraftWatchDir}
                            onLoadDirectories={loadServerDirectories}
                            onUsePath={setDraftWatchDir}
                        />
                    </div>
                </section>

                <aside className="grid content-start gap-3">
                    <Card
                        as="section"
                        padding="none"
                        className="overflow-hidden"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
                            <h2 className="text-sm font-semibold text-ink">
                                Options
                            </h2>
                            {hasDraftChanges ? (
                                <span className="text-xs font-medium text-ink-subtle">
                                    Unsaved changes
                                </span>
                            ) : null}
                        </div>

                        <div className="grid gap-3 p-3">
                            <FieldChoice
                                type="checkbox"
                                checked={draftEnabled}
                                onChange={setDraftEnabled}
                                label="Enable Auto Collect"
                            />

                            <div className="border-t border-line pt-3">
                                <p className="mb-2 text-xs font-semibold text-ink-subtle">
                                    Transfer
                                </p>
                                <div className="grid gap-2">
                                    <FieldChoice
                                        type="radio"
                                        name="collect-mode"
                                        value="copy"
                                        checked={draftIngestMode === 'copy'}
                                        onChange={(nextChecked) => {
                                            if (nextChecked) {
                                                setDraftIngestMode('copy');
                                            }
                                        }}
                                        label="Copy files"
                                    />
                                    <FieldChoice
                                        type="radio"
                                        name="collect-mode"
                                        value="move"
                                        checked={draftIngestMode === 'move'}
                                        onChange={(nextChecked) => {
                                            if (nextChecked) {
                                                setDraftIngestMode('move');
                                            }
                                        }}
                                        label="Move files"
                                    />
                                </div>
                            </div>

                            <FieldChoice
                                type="checkbox"
                                checked={draftDeleteSourceOnDelete}
                                onChange={setDraftDeleteSourceOnDelete}
                                disabled={draftIngestMode !== 'copy'}
                                label="Delete source when removing from collection"
                            />
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 border-t border-line px-3 py-2">
                            <Button
                                variant="secondary"
                                size="control"
                                onClick={handleOpenSettings}
                                disabled={loadingConfig || !hasDraftChanges}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="primary"
                                size="control"
                                onClick={() => {
                                    void handleSaveSettings();
                                }}
                                disabled={
                                    savingSettings ||
                                    !hasDraftChanges ||
                                    !normalizedDraftWatchDir
                                }
                            >
                                {savingSettings ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </Card>

                    <Card
                        as="section"
                        padding="none"
                        className="overflow-hidden"
                    >
                        <div className="border-b border-line px-3 py-2">
                            <h2 className="text-sm font-semibold text-ink">
                                Status
                            </h2>
                        </div>
                        <div className="grid gap-3 p-3">
                            <div>
                                <p className="text-xs font-semibold text-ink-subtle">
                                    Sync
                                </p>
                                <p className="mt-1 text-sm text-ink-muted">
                                    {statusSummary}
                                </p>
                            </div>
                            <div className="border-t border-line pt-3">
                                <p className="text-xs font-semibold text-ink-subtle">
                                    Watch Folder
                                </p>
                                <p className="mt-1 truncate text-sm font-medium text-ink-muted">
                                    {normalizedDraftWatchDir ||
                                        'No watch folder set'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </PageFrame>
    );
};
