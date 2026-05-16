import MagazineIssueReader from "@/components/magazine/MagazineIssueReader";
import { buildMagazineIssuePages } from "@/components/magazine/buildMagazineIssuePages";

export const metadata = {
  title: "TMI Magazine | Current Issue",
  description: "Read the current issue with mixed article, image, sponsor, poll, and video collage spreads.",
  alternates: { canonical: "/magazine/issue/current" },
};

export default function CurrentMagazineIssuePage() {
  const pages = buildMagazineIssuePages("current");
  return <MagazineIssueReader issue="current" displayIssue="1" issueTitle="The Musician's Index" pages={pages} />;
}
