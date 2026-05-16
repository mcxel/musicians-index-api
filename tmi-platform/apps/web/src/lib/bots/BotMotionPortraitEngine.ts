export type BotMotionLoop = {
  durationSeconds: 2 | 4 | 6;
  motionRef: string;
  motionHash: string;
};

function stableHash(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }
  return `m_${hash.toString(16).padStart(8, "0")}`;
}

export function generateBotMotionPortraitLoops(input: {
  botId: string;
  faceHash: string;
  style: string;
}): BotMotionLoop[] {
  return ([2, 4, 6] as const).map((duration) => {
    const motionHash = stableHash(`${input.botId}:${input.faceHash}:${duration}:${input.style}`);
    return {
      durationSeconds: duration,
      motionHash,
      motionRef: `/generated/bots/${input.botId}/motion/${motionHash}-${duration}s.mp4`,
    };
  });
}
