export type WinnerCeremonyInput = {
  winnerName: string;
  contestLabel: string;
  sponsorName?: string;
};

const TEMPLATES = [
  "{winner} takes the crown in {contest}.",
  "{winner} closes out {contest} with a final surge.",
  "{winner} wins {contest} and claims tonight’s spotlight.",
];

export function buildWinnerCeremonyLine(input: WinnerCeremonyInput): string {
  const base = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)] ?? TEMPLATES[0]!;
  const line = base
    .replace("{winner}", input.winnerName)
    .replace("{contest}", input.contestLabel);

  if (!input.sponsorName) return line;
  return `${line} Presented by ${input.sponsorName}.`;
}
