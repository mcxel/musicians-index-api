import type { AvatarRenderer } from "./AvatarRenderer";
import type { AvatarAnimator } from "./AvatarAnimator";
import type { AvatarInventory } from "./AvatarInventory";
import type { AvatarClothingEngine } from "./AvatarClothingEngine";
import type { AvatarExpressionEngine } from "./AvatarExpressionEngine";

export interface AvatarRuntime {
  renderer: AvatarRenderer;
  animator: AvatarAnimator;
  inventory: AvatarInventory;
  clothing: AvatarClothingEngine;
  expression: AvatarExpressionEngine;
}
