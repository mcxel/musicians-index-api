import { issueRegistry, type IssueRegistryEntry } from "./issueRegistry";

export type MagazinePageEntry = IssueRegistryEntry;

export const magazinePages: MagazinePageEntry[] = issueRegistry;
