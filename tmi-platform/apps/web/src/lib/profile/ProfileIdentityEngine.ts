import { getBotProfileRuntimeProfiles } from "@/lib/home/BotProfileRuntimeEngine";

export interface ProfileIdentity {
  slug: string;
  displayName: string;
  role: "fan" | "artist" | "performer" | "producer";
  bio: string;
}

export function resolveProfileIdentity(slug: string, role: ProfileIdentity["role"]): ProfileIdentity {
  const bot = getBotProfileRuntimeProfiles().find((entry) => entry.id === slug || entry.name.toLowerCase().replace(/\s+/g, "-") === slug);
  if (bot) {
    return {
      slug,
      displayName: bot.name,
      role,
      bio: `${bot.role} · ${bot.assignment}`,
    };
  }

  return {
    slug,
    displayName: slug.replace(/-/g, " "),
    role,
    bio: "Live profile identity resolved from onboarding runtime.",
  };
}
