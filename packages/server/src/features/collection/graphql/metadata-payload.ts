import { ImageMeta } from '~/models';
import { toParsedMetadata } from '~/features/live';

export function toGeneratedMetadataPayload(metadata: ImageMeta | null) {
    if (!metadata) {
        return null;
    }

    const parsed = toParsedMetadata(metadata);
    return {
        sourceType: parsed.sourceType || 'unknown',
        prompt: parsed.prompt || '',
        negativePrompt: parsed.negativePrompt || '',
        model: parsed.model,
        modelHash: parsed.modelHash,
        baseSampler: parsed.baseSampler,
        baseScheduler: parsed.baseScheduler,
        baseSteps: parsed.baseSteps,
        baseCfgScale: parsed.baseCfgScale,
        baseSeed: parsed.baseSeed,
        upscaleSampler: parsed.upscaleSampler,
        upscaleScheduler: parsed.upscaleScheduler,
        upscaleSteps: parsed.upscaleSteps,
        upscaleCfgScale: parsed.upscaleCfgScale,
        upscaleSeed: parsed.upscaleSeed,
        upscaleFactor: parsed.upscaleFactor,
        upscaler: parsed.upscaler,
        sizeWidth: parsed.sizeWidth,
        sizeHeight: parsed.sizeHeight,
        clipSkip: parsed.clipSkip,
        vae: parsed.vae,
        denoiseStrength: parsed.denoiseStrength,
        parseWarnings: parsed.parseWarnings,
        parseVersion: parsed.parseVersion || '',
    };
}
