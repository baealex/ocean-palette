import type { ChangeEvent, RefObject } from 'react';

interface HomeSampleImageInputProps {
    inputRef: RefObject<HTMLInputElement | null>;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const HomeSampleImageInput = ({
    inputRef,
    onChange,
}: HomeSampleImageInputProps) => {
    return (
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
        />
    );
};
