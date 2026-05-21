/**
 * XXL HUD entry point.
 * Imports the BerntoutGlobal_XXL_HUD component from its new home in apps/xxl/hud/.
 * The component was previously living in apps/web/src/components/hud/ — it has been
 * extracted here as part of the TMI contamination cleanup.
 */
import { BerntoutGlobalXXL } from "@/hud/BerntoutGlobalXXL";

export default function XXLPage() {
  return <BerntoutGlobalXXL />;
}
