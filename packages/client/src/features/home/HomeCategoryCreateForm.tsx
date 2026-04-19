import type { FormEvent } from 'react';

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

interface HomeCategoryCreateFormProps {
    value: string;
    saving: boolean;
    onValueChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const HomeCategoryCreateForm = ({
    value,
    saving,
    onValueChange,
    onSubmit,
}: HomeCategoryCreateFormProps) => {
    return (
        <form onSubmit={onSubmit} className="flex w-full gap-2 lg:w-[420px]">
            <Input
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder="Enter a category"
                aria-label="Category name"
                inputSize="control"
                tone="control"
                className="min-w-0 flex-1"
                disabled={saving}
            />
            <Button
                type="submit"
                variant="primary"
                size="control"
                className="shrink-0"
                disabled={saving}
            >
                Add Category
            </Button>
        </form>
    );
};
