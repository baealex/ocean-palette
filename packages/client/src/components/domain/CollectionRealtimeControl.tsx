import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Switch } from '~/components/ui/Switch';
import { useToast } from '~/components/ui/ToastProvider';
import { useAutoCollectControl } from '~/features/collection/use-auto-collect-control';

export const CollectionRealtimeControl = () => {
    const { pushToast } = useToast();

    const {
        feedback,
        loadingConfig,
        collectingNow,
        statusSyncing,
        statusSyncReason,
        statusSyncScanned,
        statusSyncUpdatedAt,
        togglingEnabled,
        statusEnabled,
        handleToggleEnabled,
        handleCollectNow,
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

    return (
        <section className="rounded-token-md border border-line/70 bg-surface-base px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={statusEnabled}
                        label="Auto Collect"
                        disabled={loadingConfig || togglingEnabled}
                        onCheckedChange={() => {
                            void handleToggleEnabled();
                        }}
                    />
                    <div className="min-w-0">
                        <span className="text-sm font-semibold text-ink-muted">
                            Auto Collect
                        </span>
                        <p className="text-xs text-ink-subtle">
                            {statusSummary}
                        </p>
                    </div>
                    {loadingConfig || collecting ? (
                        <Badge variant="neutral">
                            {collecting ? 'Collecting...' : 'Syncing...'}
                        </Badge>
                    ) : null}
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="control"
                        size="compact"
                        onClick={() => {
                            void handleCollectNow();
                        }}
                        disabled={collecting || loadingConfig}
                    >
                        {collecting ? 'Collecting...' : 'Collect now'}
                    </Button>
                    <Link
                        to="/collection/auto-collect"
                        className="ui-focus-ring inline-flex h-10 items-center justify-center rounded-token-md border border-transparent bg-transparent px-3 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                        Settings
                    </Link>
                </div>
            </div>
        </section>
    );
};
