import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { Button } from '~/components/ui/Button';
import {
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
} from '~/components/ui/Dialog';
import { Field, FieldLabel } from '~/components/ui/Field';
import { Input } from '~/components/ui/Input';
import { Textarea } from '~/components/ui/Textarea';
import type { KeywordFieldsInput } from '~/features/keyword/api';
import type { Keyword } from '~/models/types';

interface KeywordFieldsDialogProps {
    open: boolean;
    categoryName?: string;
    keyword: Keyword | null;
    submitting?: boolean;
    onSubmit: (values: KeywordFieldsInput) => void;
    onOpenChange: (open: boolean) => void;
}

const createInitialValues = (keyword: Keyword | null): KeywordFieldsInput => ({
    name: keyword?.name ?? '',
    meaning: keyword?.meaning ?? '',
    effect: keyword?.effect ?? '',
    note: keyword?.note ?? '',
});

export const KeywordFieldsDialog = ({
    open,
    categoryName,
    keyword,
    submitting = false,
    onSubmit,
    onOpenChange,
}: KeywordFieldsDialogProps) => {
    const [values, setValues] = useState<KeywordFieldsInput>(
        createInitialValues(keyword),
    );

    useEffect(() => {
        if (open) {
            setValues(createInitialValues(keyword));
        }
    }, [keyword, open]);

    const setValue =
        (field: keyof KeywordFieldsInput) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValues((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!values.name.trim()) {
            return;
        }
        onSubmit(values);
    };

    const title = keyword ? 'Edit keyword' : 'Add keyword details';
    const categoryLabel = categoryName ? ` in ${categoryName}` : '';

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent className="max-w-xl">
                    <DialogTitle>
                        {title}
                        {categoryLabel}
                    </DialogTitle>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <Field>
                            <FieldLabel htmlFor="keyword-name">
                                Keyword
                            </FieldLabel>
                            <Input
                                id="keyword-name"
                                value={values.name}
                                onChange={setValue('name')}
                                disabled={submitting}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="keyword-meaning">
                                Meaning
                            </FieldLabel>
                            <Input
                                id="keyword-meaning"
                                value={values.meaning}
                                onChange={setValue('meaning')}
                                disabled={submitting}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="keyword-effect">
                                Effect
                            </FieldLabel>
                            <Textarea
                                id="keyword-effect"
                                textareaSize="compact"
                                value={values.effect}
                                onChange={setValue('effect')}
                                disabled={submitting}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="keyword-note">Note</FieldLabel>
                            <Textarea
                                id="keyword-note"
                                textareaSize="compact"
                                value={values.note}
                                onChange={setValue('note')}
                                disabled={submitting}
                            />
                        </Field>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={
                                    submitting ||
                                    values.name.trim().length === 0
                                }
                            >
                                {submitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </DialogPortal>
        </DialogRoot>
    );
};
