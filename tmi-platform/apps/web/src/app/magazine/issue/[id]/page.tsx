import { notFound } from "next/navigation";
import MagazineIssueReader from "@/components/magazine/MagazineIssueReader";
import { buildMagazineIssuePages } from "@/components/magazine/buildMagazineIssuePages";

type MagazineIssueByIdProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function MagazineIssueByIdPage({ params }: MagazineIssueByIdProps) {
  const issueId = params.id;
  if (!/^\d+$/.test(issueId)) {
    notFound();
  }

  const pages = buildMagazineIssuePages(issueId);
  return <MagazineIssueReader issue={issueId} issueTitle="The Musician's Index" pages={pages} />;
}
