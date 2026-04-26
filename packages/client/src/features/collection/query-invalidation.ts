import type { QueryClient } from '@tanstack/react-query';

import { collectionQueryKeys } from './query-keys';

export const invalidateCollectionCatalogQueries = async (
    queryClient: QueryClient,
) => {
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: collectionQueryKeys.listRoot(),
            exact: false,
        }),
        queryClient.invalidateQueries({
            queryKey: collectionQueryKeys.showcaseRoot(),
            exact: false,
        }),
        queryClient.invalidateQueries({
            queryKey: collectionQueryKeys.modelOptions(),
            exact: true,
        }),
    ]);
};
