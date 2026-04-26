import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
    createToast,
    ToastProvider as BaseToastProvider,
} from '@baejino/react-ui/toast';

import { STATUS_INTENT_CLASS } from './status-styles';

type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

interface ToastInput {
    message: string;
    variant?: ToastVariant;
    durationMs?: number;
}

interface ToastItem {
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    pushToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const toast = createToast();

const VARIANT_CLASS: Record<ToastVariant, string> = {
    ...STATUS_INTENT_CLASS,
    neutral: 'border-line bg-surface-muted text-ink-muted',
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const showToast = useCallback((item: ToastItem, durationMs: number) => {
        const options = {
            duration: durationMs,
            className: `rounded-token-md border px-3 py-2 text-sm shadow-overlay ${VARIANT_CLASS[item.variant]}`,
        };
        if (item.variant === 'success') {
            toast.success(item.message, options);
            return;
        }
        if (item.variant === 'error') {
            toast.error(item.message, options);
            return;
        }
        if (item.variant === 'warning') {
            toast.warning(item.message, options);
            return;
        }
        if (item.variant === 'info') {
            toast.info(item.message, options);
            return;
        }
        toast(item.message, options);
    }, []);

    const pushToast = useCallback(
        (input: ToastInput) => {
            const variant = input.variant ?? 'neutral';
            const durationMs =
                input.durationMs ?? (variant === 'error' ? 4200 : 2600);
            showToast(
                {
                    message: input.message,
                    variant,
                },
                durationMs,
            );
        },
        [showToast],
    );

    const contextValue = useMemo(() => ({ pushToast }), [pushToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <BaseToastProvider
                closeButton
                position="bottom-right"
                expand
                toastOptions={{
                    classNames: {
                        closeButton:
                            'ui-focus-ring rounded-token-sm border border-line bg-surface-base text-xs text-ink-muted',
                    },
                }}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
