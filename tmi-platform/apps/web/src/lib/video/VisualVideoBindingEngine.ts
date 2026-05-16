import { convertImageToMotionLoop, type ImageToMotionSubjectType } from "@/lib/ai-motion/AiImageToMotionEngine";

export type MotionLoopDuration = 2 | 4 | 6 | 7;

export type VisualMotionBinding = {
  sourceImageRef: string;
  route: string;
  ownerSystem: string;
  subjectType: ImageToMotionSubjectType;
  loops: Array<{
    durationSeconds: MotionLoopDuration;
    motionId: string;
    score: number;
  }>;
};

export class VisualVideoBindingEngine {
  static bindImageToMotionVariants(input: {
    imageRef: string;
    route: string;
    ownerSystem: string;
    subjectType: ImageToMotionSubjectType;
    durations?: MotionLoopDuration[];
  }): VisualMotionBinding {
    const durations = input.durations ?? [2, 4, 6, 7];
    const loops = durations.map((durationSeconds) => {
      const result = convertImageToMotionLoop({
        imageRef: input.imageRef,
        subjectType: input.subjectType,
        ownerSystem: input.ownerSystem,
        route: input.route,
        durationSeconds,
      });

      return {
        durationSeconds,
        motionId: result.motionId,
        score: result.score,
      };
    });

    return {
      sourceImageRef: input.imageRef,
      route: input.route,
      ownerSystem: input.ownerSystem,
      subjectType: input.subjectType,
      loops,
    };
  }
}
