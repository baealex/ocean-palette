import { Outlet } from '@tanstack/react-router';

import { SiteHeader } from './SiteHeader';

export const SiteLayout = () => {
    return (
        <div className="min-h-screen bg-bg">
            <SiteHeader />

            <main className="mx-auto max-w-6xl px-3 py-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:px-4 sm:py-6 md:pb-6">
                <Outlet />
            </main>
        </div>
    );
};
