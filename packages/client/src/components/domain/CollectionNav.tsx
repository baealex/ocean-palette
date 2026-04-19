import { Button } from '~/components/ui/Button';
import { DataIcon, GridIcon, ListIcon } from '~/icons';
import type { CollectionView } from '~/features/collection/view-filter';

interface CollectionNavProps {
    view: CollectionView;
    onViewChange: (view: CollectionView) => void;
}

export const CollectionNav = ({ view, onViewChange }: CollectionNavProps) => {
    return (
        <nav className="flex" aria-label="Collection view tabs">
            <div className="inline-flex items-center gap-0.5 rounded-token-lg bg-surface-muted p-1">
                <Button
                    type="button"
                    variant="tab"
                    size="tab"
                    aria-pressed={view === 'list'}
                    onClick={() => onViewChange('list')}
                >
                    <ListIcon width={13} height={13} />
                    List
                </Button>
                <Button
                    type="button"
                    variant="tab"
                    size="tab"
                    aria-pressed={view === 'gallery'}
                    onClick={() => onViewChange('gallery')}
                >
                    <GridIcon width={13} height={13} />
                    Grid
                </Button>
                <Button
                    type="button"
                    variant="tab"
                    size="tab"
                    aria-pressed={view === 'browse'}
                    onClick={() => onViewChange('browse')}
                >
                    <DataIcon width={13} height={13} />
                    Browse
                </Button>
            </div>
        </nav>
    );
};
