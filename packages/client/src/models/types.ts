export interface KeywordToCategory {
    id: number;
    order: number;
}

export interface KeywordAlias {
    id: number;
    name: string;
    keywordId: number;
}

export interface KeywordUsage {
    keywordId: number;
    totalCount: number;
    promptCount: number;
    negativePromptCount: number;
    aliases: string[];
}

export interface Keyword {
    id: number;
    name: string;
    meaning?: string;
    effect?: string;
    note?: string;
    image?: Image;
    aliases?: KeywordAlias[];
    usage?: KeywordUsage;
    categories?: KeywordToCategory[];
}

export interface Category {
    id: number;
    name: string;
    order: number;
    keywords: Keyword[];
}

export interface Image {
    id: number;
    url: string;
    width: number;
    height: number;
    createdAt?: string;
}

export interface GeneratedMetadata {
    sourceType: string;
    prompt: string;
    negativePrompt: string;
    model?: string;
    modelHash?: string;
    baseSampler?: string;
    baseScheduler?: string;
    baseSteps?: number;
    baseCfgScale?: number;
    baseSeed?: string;
    upscaleSampler?: string;
    upscaleScheduler?: string;
    upscaleSteps?: number;
    upscaleCfgScale?: number;
    upscaleSeed?: string;
    upscaleFactor?: number;
    upscaler?: string;
    sizeWidth?: number;
    sizeHeight?: number;
    clipSkip?: number;
    vae?: string;
    denoiseStrength?: number;
    parseWarnings: string[];
    parseVersion: string;
}

export interface Collection {
    id: number;
    image: Image;
    title: string;
    prompt: string;
    negativePrompt: string;
    generatedAt?: string | null;
    generatedMetadata?: GeneratedMetadata | null;
}
