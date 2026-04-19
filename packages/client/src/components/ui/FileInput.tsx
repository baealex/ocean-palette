import { useEffect, useRef, useState } from 'react';

import { Button } from './Button';
import { Card } from './Card';

interface FileInputProps {
    accept?: string;
    disabled?: boolean;
    title?: string;
    chooseLabel?: string;
    emptyFileLabel?: string;
    emptyPreviewLabel?: string;
    helperText?: string;
    onSelect: (file: File | null) => void;
}

const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export const FileInput = ({
    accept,
    disabled = false,
    title = 'File',
    chooseLabel = 'Choose File',
    emptyFileLabel = 'No file selected',
    emptyPreviewLabel = 'No preview',
    helperText = 'Select an image file (PNG, JPG, WEBP)',
    onSelect,
}: FileInputProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
        };
    }, []);

    const updatePreview = (file: File | null) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        if (!file || !file.type.startsWith('image/')) {
            setPreviewUrl(null);
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        previewUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
    };

    const handleSelect = (file: File | null) => {
        setSelectedFile(file);
        updatePreview(file);
        onSelect(file);
    };

    return (
        <Card padding="none" className="overflow-hidden">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={(event) => {
                    handleSelect(event.target.files?.[0] ?? null);
                }}
            />

            <div className="border-b border-line p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-ink">
                            {title}
                        </h2>
                        <p className="mt-1 truncate text-xs font-medium text-ink-subtle">
                            {selectedFile ? selectedFile.name : emptyFileLabel}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                            variant="control"
                            size="control"
                            disabled={disabled}
                            onClick={() => inputRef.current?.click()}
                        >
                            {chooseLabel}
                        </Button>
                        {selectedFile ? (
                            <Button
                                variant="text"
                                size="control"
                                disabled={disabled}
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                    }
                                    handleSelect(null);
                                }}
                            >
                                Clear
                            </Button>
                        ) : null}
                    </div>
                </div>

                <p className="mt-3 text-xs text-ink-subtle">
                    {selectedFile
                        ? `${selectedFile.type || 'unknown'} / ${formatFileSize(selectedFile.size)}`
                        : helperText}
                </p>
            </div>

            {previewUrl ? (
                <div className="bg-surface-muted p-2">
                    <div className="overflow-hidden rounded-token-sm border border-line/70 bg-surface-base">
                        <img
                            src={previewUrl}
                            alt={selectedFile?.name ?? 'Selected preview'}
                            className="block h-auto w-full"
                        />
                    </div>
                </div>
            ) : (
                <div className="grid min-h-[220px] place-items-center bg-surface-muted px-4 py-8">
                    <p className="text-sm text-ink-subtle">
                        {emptyPreviewLabel}
                    </p>
                </div>
            )}
        </Card>
    );
};
