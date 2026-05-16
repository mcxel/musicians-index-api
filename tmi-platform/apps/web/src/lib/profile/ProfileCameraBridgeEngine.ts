export type ProfileCameraBinding = {
  slug: string;
  deviceId: string;
  label?: string;
  quality: "low" | "medium" | "high";
  boundAt: number;
};

const cameraBindings = new Map<string, ProfileCameraBinding>();

function key(slug: string): string {
  return slug.trim().toLowerCase();
}

export function bindProfileCamera(input: {
  slug: string;
  deviceId: string;
  label?: string;
  quality?: "low" | "medium" | "high";
}): ProfileCameraBinding {
  const binding: ProfileCameraBinding = {
    slug: key(input.slug),
    deviceId: input.deviceId,
    label: input.label,
    quality: input.quality ?? "high",
    boundAt: Date.now(),
  };
  cameraBindings.set(binding.slug, binding);
  return binding;
}

export function getProfileCameraBinding(slug: string): ProfileCameraBinding | null {
  return cameraBindings.get(key(slug)) ?? null;
}

export function clearProfileCameraBinding(slug: string): void {
  cameraBindings.delete(key(slug));
}
