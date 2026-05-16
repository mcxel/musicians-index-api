export type NarrationVoice = "default" | "calm" | "energetic";
export type NarrationMode = "manual" | "autoplay";

export type ArticleNarrationConfig = {
  articleId: string;
  title: string;
  voice: NarrationVoice;
  mode: NarrationMode;
  accessibilityEnabled: boolean;
};

export function createArticleNarrationConfig(
  articleId: string,
  title: string,
  voice: NarrationVoice = "default",
  mode: NarrationMode = "manual",
): ArticleNarrationConfig {
  return {
    articleId,
    title,
    voice,
    mode,
    accessibilityEnabled: true,
  };
}
