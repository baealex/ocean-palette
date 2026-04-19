import type { MouseEvent } from 'react';

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '~/components/ui/HoverCard';
import { Button } from '~/components/ui/Button';
import { cn } from '~/components/ui/cn';
import type { Keyword } from '~/models/types';

interface KeywordsListProps {
    keywords: Keyword[];
    className?: string;
    onClick?: (keyword: Keyword) => void;
    onContextMenu?: (
        event: MouseEvent<HTMLButtonElement>,
        keyword: Keyword,
    ) => void;
}

const KEYWORD_BUTTON_CLASS =
    'h-auto min-h-8 max-w-full justify-start rounded-token-sm px-2.5 py-1.5 text-left text-xs font-medium';

export const KeywordsList = ({
    keywords,
    className,
    onClick,
    onContextMenu,
}: KeywordsListProps) => {
    return (
        <ul className={cn('mb-4 flex flex-wrap gap-2', className)}>
            {keywords.map((keyword) => {
                const keywordButton = (
                    <Button
                        type="button"
                        variant="control"
                        size="compact"
                        onClick={() => onClick?.(keyword)}
                        onContextMenu={(event) =>
                            onContextMenu?.(event, keyword)
                        }
                        className={KEYWORD_BUTTON_CLASS}
                    >
                        <span className="truncate">{keyword.name}</span>
                    </Button>
                );

                return (
                    <li key={keyword.id} className="list-none">
                        {keyword.image ? (
                            <HoverCard openDelay={120} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                    {keywordButton}
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="right"
                                    align="start"
                                    className="w-28 p-0"
                                >
                                    <img
                                        loading="lazy"
                                        src={keyword.image.url}
                                        alt={keyword.name}
                                        className="block h-auto w-full"
                                    />
                                </HoverCardContent>
                            </HoverCard>
                        ) : (
                            keywordButton
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
