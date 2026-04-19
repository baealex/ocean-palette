import { useCallback, useMemo, useState } from 'react';

import type { LiveDirectoryEntry } from '~/api';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Notice } from '~/components/ui/Notice';
import { ArrowUpIcon } from '~/icons';

interface AutoCollectDirectoryBrowserPanelProps {
    loading: boolean;
    currentPath: string;
    parentPath: string | null;
    roots: string[];
    entries: LiveDirectoryEntry[];
    watchPath: string;
    onLoadDirectories: (targetPath?: string) => Promise<void>;
    onUsePath: (path: string) => void;
}

export const AutoCollectDirectoryBrowserPanel = ({
    loading,
    currentPath,
    parentPath,
    roots,
    entries,
    watchPath,
    onLoadDirectories,
    onUsePath,
}: AutoCollectDirectoryBrowserPanelProps) => {
    const [entryQuery, setEntryQuery] = useState('');
    const [localNavigating, setLocalNavigating] = useState(false);
    const [navigatingPath, setNavigatingPath] = useState<string | null>(null);
    const busy = loading || localNavigating;

    const normalizedEntryQuery = entryQuery.trim().toLowerCase();
    const isCurrentPathSelected = Boolean(
        currentPath && watchPath && currentPath.trim() === watchPath.trim(),
    );
    const visibleEntries = useMemo(() => {
        if (normalizedEntryQuery.length === 0) {
            return entries;
        }

        return entries.filter((entry) =>
            entry.name.toLowerCase().includes(normalizedEntryQuery),
        );
    }, [entries, normalizedEntryQuery]);

    const breadcrumbs = useMemo(() => {
        if (!currentPath) {
            return [] as Array<{ label: string; path: string }>;
        }

        const windows = /^[A-Za-z]:/.test(currentPath);
        const unix = currentPath.startsWith('/');
        const parts = currentPath.split(/[/\\]+/).filter(Boolean);
        const result: Array<{ label: string; path: string }> = [];

        if (windows && parts.length > 0) {
            let running = parts[0];
            result.push({ label: parts[0], path: `${parts[0]}\\` });
            for (const part of parts.slice(1)) {
                running = `${running}\\${part}`;
                result.push({ label: part, path: running });
            }
            return result;
        }

        if (unix) {
            let running = '';
            result.push({ label: '/', path: '/' });
            for (const part of parts) {
                running = `${running}/${part}`;
                result.push({ label: part, path: running });
            }
            return result;
        }

        let running = '';
        for (const part of parts) {
            running = running ? `${running}/${part}` : part;
            result.push({ label: part, path: running });
        }
        return result;
    }, [currentPath]);

    const navigateToDirectory = useCallback(
        async (targetPath?: string) => {
            const normalizedTarget = targetPath?.trim();
            const nextPath =
                normalizedTarget && normalizedTarget.length > 0
                    ? normalizedTarget
                    : undefined;

            setLocalNavigating(true);
            setNavigatingPath(nextPath || currentPath || null);
            try {
                await onLoadDirectories(nextPath);
            } finally {
                setLocalNavigating(false);
                setNavigatingPath(null);
            }
        },
        [currentPath, onLoadDirectories],
    );

    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-token-md border border-line/70 bg-surface-base">
            <div className="flex flex-col gap-2 border-b border-line p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Button
                        variant="control"
                        size="compact"
                        onClick={() => {
                            if (!parentPath) {
                                return;
                            }
                            void navigateToDirectory(parentPath);
                        }}
                        disabled={!parentPath || busy}
                    >
                        <ArrowUpIcon width={14} height={14} />
                    </Button>
                    <div className="flex min-w-0 flex-1 items-center overflow-x-auto rounded-token-sm border border-line bg-surface-base px-2 py-1">
                        {breadcrumbs.length > 0 ? (
                            breadcrumbs.map((crumb, index) => (
                                <div
                                    key={`${crumb.path}-${crumb.label}`}
                                    className="flex shrink-0 items-center"
                                >
                                    {index > 0 ? (
                                        <span className="px-1 text-xs text-ink-subtle">
                                            /
                                        </span>
                                    ) : null}
                                    <Button
                                        variant="text"
                                        size="compact"
                                        className="h-8 px-1.5 text-xs"
                                        onClick={() => {
                                            void navigateToDirectory(
                                                crumb.path,
                                            );
                                        }}
                                        disabled={busy}
                                    >
                                        {crumb.label}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <span className="truncate py-1 text-xs text-ink-muted">
                                No folder selected
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="control"
                        size="compact"
                        onClick={() => {
                            void navigateToDirectory(currentPath || undefined);
                        }}
                        disabled={busy}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid min-h-0 md:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="min-h-0 overflow-auto border-b border-line bg-surface-muted/60 p-2 md:border-r md:border-b-0">
                    <p className="mb-2 px-2 text-xs font-semibold text-ink-subtle">
                        Locations
                    </p>
                    <div className="grid gap-1">
                        {roots.length > 0 ? (
                            roots.map((rootPath) => (
                                <Button
                                    key={rootPath}
                                    variant={
                                        currentPath === rootPath
                                            ? 'control'
                                            : 'text'
                                    }
                                    size="compact"
                                    className="h-auto min-h-9 w-full justify-start px-2 py-1.5"
                                    onClick={() => {
                                        void navigateToDirectory(rootPath);
                                    }}
                                    disabled={busy}
                                >
                                    {rootPath}
                                </Button>
                            ))
                        ) : (
                            <Notice
                                variant="neutral"
                                className="text-center text-xs"
                            >
                                No roots available
                            </Notice>
                        )}
                    </div>
                </aside>

                <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-surface-base p-2">
                    <div className="mb-2 grid gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                        <p className="px-1 text-xs font-semibold text-ink-subtle">
                            Folders
                        </p>
                        <Input
                            value={entryQuery}
                            onChange={(event) =>
                                setEntryQuery(event.target.value)
                            }
                            placeholder="Filter folders"
                            aria-label="Filter folders"
                        />
                        <Button
                            variant="text"
                            size="control"
                            onClick={() => setEntryQuery('')}
                            disabled={entryQuery.trim().length === 0}
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="min-h-0 overflow-y-auto overscroll-contain rounded-token-sm border border-line bg-surface-base p-2">
                        {busy ? (
                            <Notice variant="neutral" className="text-center">
                                Opening {navigatingPath || 'folder'}...
                            </Notice>
                        ) : null}

                        {!busy && entries.length === 0 ? (
                            <Notice variant="neutral" className="text-center">
                                No subfolders in this location
                            </Notice>
                        ) : null}

                        {!busy &&
                        entries.length > 0 &&
                        visibleEntries.length === 0 ? (
                            <Notice variant="neutral" className="text-center">
                                No folders match this filter
                            </Notice>
                        ) : null}

                        {!busy && visibleEntries.length > 0 ? (
                            <div className="grid gap-1">
                                {visibleEntries.map((entry) => (
                                    <Button
                                        key={entry.path}
                                        variant="text"
                                        size="control"
                                        className="w-full justify-start px-2 text-left font-medium"
                                        onClick={() => {
                                            void navigateToDirectory(
                                                entry.path,
                                            );
                                        }}
                                        disabled={busy}
                                    >
                                        <span className="truncate">
                                            {entry.name}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>

            <div className="flex flex-col gap-2 border-t border-line p-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 truncate text-xs text-ink-muted">
                    {isCurrentPathSelected
                        ? 'Current folder is selected'
                        : currentPath || 'Open a folder to choose a watch path'}
                </p>
                <Button
                    variant={isCurrentPathSelected ? 'control' : 'secondary'}
                    size="control"
                    onClick={() => {
                        if (!currentPath || isCurrentPathSelected) {
                            return;
                        }
                        onUsePath(currentPath);
                    }}
                    disabled={!currentPath || busy || isCurrentPathSelected}
                >
                    {isCurrentPathSelected ? 'Selected' : 'Use This Folder'}
                </Button>
            </div>
        </div>
    );
};
