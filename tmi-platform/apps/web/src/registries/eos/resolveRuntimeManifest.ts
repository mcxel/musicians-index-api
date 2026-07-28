/**
 * Resolves a full RuntimeManifest from experience + role for StageLoader.
 */

import type { EosRole, RuntimeManifest } from "@/core/eos/types";
import { assertExperienceReady } from "@/core/eos/RuntimeValidator";
import { getExperienceById } from "./ExperienceRegistry";
import { getVenueById } from "./VenueRegistry";
import { getWidgetsForExperience } from "./WidgetRegistry";
import { getCameraPackById } from "./CameraRegistry";
import { getAnimationPackById } from "./AnimationRegistry";
import { canAccessExperience } from "./RoleRegistry";

export function resolveRuntimeManifest(
  experienceId: string,
  role: EosRole = "fan"
): RuntimeManifest {
  const experience = assertExperienceReady(experienceId);

  if (!canAccessExperience(role, experience)) {
    throw new Error(`EOS: Role ${role} cannot access experience ${experienceId}`);
  }

  const venue = getVenueById(experience.venueId);
  if (!venue) {
    throw new Error(`EOS: Venue not found for ${experience.venueId}`);
  }

  const cameraPack = getCameraPackById(experience.cameraPackId);
  if (!cameraPack) {
    throw new Error(`EOS: Camera pack not found: ${experience.cameraPackId}`);
  }

  const animationPack = getAnimationPackById(experience.animationPackId);
  if (!animationPack) {
    throw new Error(`EOS: Animation pack not found: ${experience.animationPackId}`);
  }

  return {
    experience,
    venue,
    role,
    widgets: getWidgetsForExperience(experience.widgetIds),
    cameraPack,
    animationPack,
  };
}

export { getAllExperiences, EXPERIENCE_REGISTRY } from "./ExperienceRegistry";
