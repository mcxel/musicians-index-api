const BOT_EXPRESSIONS = [
  "happy",
  "focused",
  "excited",
  "neutral",
  "surprised",
  "celebrating",
  "thinking",
] as const;

export type BotExpression = (typeof BOT_EXPRESSIONS)[number];

export type BotExpressionAsset = {
  expression: BotExpression;
  imageRef: string;
  prompt: string;
};

export function listBotExpressions(): BotExpression[] {
  return [...BOT_EXPRESSIONS];
}

export function generateBotExpressionAssets(input: {
  botId: string;
  baseSeed: string;
  style: string;
}): BotExpressionAsset[] {
  return BOT_EXPRESSIONS.map((expression) => ({
    expression,
    imageRef: `/generated/bots/${input.botId}/expressions/${expression}-${input.baseSeed.slice(0, 8)}.webp`,
    prompt: `synthetic bot portrait, ${expression} expression, ${input.style} style, generated identity`,
  }));
}
