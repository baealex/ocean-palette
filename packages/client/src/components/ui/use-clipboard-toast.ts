import { useCallback } from 'react';

import { useToast } from './ToastProvider';

interface CopyOptions {
    label?: string;
    successMessage?: string;
    errorMessage?: string;
}

const copyWithSelectionFallback = (text: string) => {
    if (typeof document === 'undefined' || !document.body) {
        return false;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
};

export const useClipboardToast = () => {
    const { pushToast } = useToast();

    const copyToClipboard = useCallback(
        async (text: string, options: CopyOptions = {}) => {
            let copied = false;

            if (
                typeof navigator !== 'undefined' &&
                navigator.clipboard?.writeText
            ) {
                try {
                    await navigator.clipboard.writeText(text);
                    copied = true;
                } catch {
                    copied = copyWithSelectionFallback(text);
                }
            } else {
                copied = copyWithSelectionFallback(text);
            }

            if (copied) {
                pushToast({
                    message:
                        options.successMessage ??
                        `${options.label ?? 'Text'} copied`,
                    variant: 'success',
                });
                return true;
            }

            pushToast({
                message: options.errorMessage ?? 'Copy failed',
                variant: 'error',
            });
            return false;
        },
        [pushToast],
    );

    return { copyToClipboard };
};
