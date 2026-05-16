import { TMI_ONBOARDING_CHECKLIST } from "@/lib/onboarding/tmiOnboardingChecklist";

export default function OnboardingVenuePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10 text-white">
      <h1 className="mb-3 text-3xl font-bold text-[#ff6b35]">Venue Onboarding</h1>
      <p className="mb-6 text-gray-400">Complete your venue launch checklist.</p>
      <ul className="space-y-2">
        {TMI_ONBOARDING_CHECKLIST.map((item) => (
          <li key={item.id} className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm">
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
