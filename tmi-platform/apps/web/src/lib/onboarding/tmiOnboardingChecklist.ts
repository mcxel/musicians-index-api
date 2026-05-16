export type TmiOnboardingChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const TMI_ONBOARDING_CHECKLIST: TmiOnboardingChecklistItem[] = [
  { id: "profile", label: "Complete profile", required: true },
  { id: "media", label: "Upload media", required: true },
  { id: "links", label: "Add links", required: true },
  { id: "payments", label: "Connect payments", required: true },
  { id: "first-post", label: "Publish first post", required: true },
  { id: "first-message", label: "Send first message", required: true },
  { id: "first-share", label: "Share first page", required: true },
];
