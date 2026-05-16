import { createAiVisual } from "@/lib/ai-visuals/AiVisualCreatorEngine";
import { VisualVideoBindingEngine } from "@/lib/video/VisualVideoBindingEngine";

export type BotImageSuite = {
  botId: string;
  route: string;
  profilePhotoRef: string;
  bodyPortraitRef: string;
  articlePortraitRef: string;
  videoPortraitRef: string;
  motionPortraitRef: string;
  motionBindings: ReturnType<typeof VisualVideoBindingEngine.bindImageToMotionVariants>;
};

function outputRefOrGenerated(assetId: string, outputRef?: string): string {
  return outputRef ?? `/generated/ai/${assetId}.webp`;
}

export class BotImageGenerationEngine {
  static generateBotVisualSuite(input: {
    botId: string;
    botName: string;
    route: string;
    ownerSystem?: string;
  }): BotImageSuite {
    const ownerSystem = input.ownerSystem ?? "bot-visual-runtime";

    const profile = createAiVisual({
      assetType: "avatar-reference",
      subject: `${input.botName} profile photo`,
      ownerSystem,
      targetRoute: input.route,
      targetComponent: "BotProfileCard",
      style: "tmi-neon-portrait",
    });

    const body = createAiVisual({
      assetType: "image",
      subject: `${input.botName} body portrait`,
      ownerSystem,
      targetRoute: input.route,
      targetComponent: "BotBodyPortrait",
      style: "tmi-editorial-body",
    });

    const article = createAiVisual({
      assetType: "poster",
      subject: `${input.botName} article portrait`,
      ownerSystem,
      targetRoute: input.route,
      targetComponent: "BotArticlePortrait",
      style: "tmi-magazine-portrait",
    });

    const video = createAiVisual({
      assetType: "image",
      subject: `${input.botName} video portrait`,
      ownerSystem,
      targetRoute: input.route,
      targetComponent: "BotVideoPortrait",
      style: "tmi-video-ready",
    });

    const motionSeed = createAiVisual({
      assetType: "image",
      subject: `${input.botName} motion portrait seed`,
      ownerSystem,
      targetRoute: input.route,
      targetComponent: "BotMotionPortrait",
      style: "tmi-motion-seed",
    });

    const motionRef = outputRefOrGenerated(motionSeed.assetId, motionSeed.outputRef);
    const motionBindings = VisualVideoBindingEngine.bindImageToMotionVariants({
      imageRef: motionRef,
      route: input.route,
      ownerSystem,
      subjectType: "artist-image",
      durations: [2, 4, 6, 7],
    });

    return {
      botId: input.botId,
      route: input.route,
      profilePhotoRef: outputRefOrGenerated(profile.assetId, profile.outputRef),
      bodyPortraitRef: outputRefOrGenerated(body.assetId, body.outputRef),
      articlePortraitRef: outputRefOrGenerated(article.assetId, article.outputRef),
      videoPortraitRef: outputRefOrGenerated(video.assetId, video.outputRef),
      motionPortraitRef: motionRef,
      motionBindings,
    };
  }
}
