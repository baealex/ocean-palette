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

interface KeywordFieldsFormValues {
    name: string;
    meaning: string;
    effect: string;
    note: string;
    aliases: string;
}

const createInitialValues = (
    keyword: Keyword | null,
): KeywordFieldsFormValues => ({
    name: keyword?.name ?? '',
    meaning: keyword?.meaning ?? '',
    effect: keyword?.effect ?? '',
    note: keyword?.note ?? '',
    aliases: keyword?.aliases?.map((alias) => alias.name).join(', ') ?? '',
});

const parseAliases = (value: string) =>
    value
        .split(',')
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);

export const KeywordFieldsDialog = ({
    open,
    categoryName,
    keyword,
    submitting = false,
    onSubmit,
    onOpenChange,
}: KeywordFieldsDialogProps) => {
    const [values, setValues] = useState<KeywordFieldsFormValues>(
        createInitialValues(keyword),
    );

    useEffect(() => {
        if (open) {
            setValues(createInitialValues(keyword));
        }
    }, [keyword, open]);

    const setValue =
        (field: keyof KeywordFieldsFormValues) =>
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
        onSubmit({
            name: values.name,
            meaning: values.meaning,
            effect: values.effect,
            note: values.note,
            aliases: parseAliases(values.aliases),
        });
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
                            <FieldLabel htmlFor="keyword-aliases">
                                Aliases
                            </FieldLabel>
                            <Input
                                id="keyword-aliases"
                                value={values.aliases}
                                onChange={setValue('aliases')}
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
