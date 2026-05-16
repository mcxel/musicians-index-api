export type EnvironmentCheckItem = {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
};

const REQUIRED_ENV_KEYS = [
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", label: "Clerk Publishable Key" },
  { key: "CLERK_SECRET_KEY", label: "Clerk Secret Key" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key" },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook Secret" },
  { key: "CLOUDINARY_URL", label: "Cloudinary URL" },
  { key: "DATABASE_URL", label: "Database URL" },
  { key: "RESEND_API_KEY", label: "Resend API Key" },
  { key: "NEXT_PUBLIC_APP_URL", label: "App URL" },
] as const;

export function getEnvironmentChecklist(): EnvironmentCheckItem[] {
  return REQUIRED_ENV_KEYS.map((item) => ({
    key: item.key,
    label: item.label,
    required: true,
    configured: Boolean(process.env[item.key]),
  }));
}
