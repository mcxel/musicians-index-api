import MagazineBookShell, { type MagazineSpread } from "./MagazineBookShell";
import MagazineIssueSurface from "./MagazineIssueSurface";
import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";

type MagazineSpreadRendererProps = {
  article: MagazineArticle;
  related: MagazineArticle[];
  issueNumber?: number;
  initialSpread?: number;
};

export default function MagazineSpreadRenderer({ article, related, issueNumber = 1, initialSpread = 1 }: MagazineSpreadRendererProps) {
  const spreads: MagazineSpread[] = [
    {
      id: "cover",
      label: `Issue ${issueNumber} Cover`,
      pageRange: "01-02",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="cover-left" pageNumber={1} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="cover-right" pageNumber={2} />,
    },
    {
      id: "article",
      label: `Issue ${issueNumber} Article Spread`,
      pageRange: "03-04",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="article-left" pageNumber={3} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="article-right" pageNumber={4} />,
    },
    {
      id: "sponsor-editorial",
      label: `Issue ${issueNumber} Sponsor Spread`,
      pageRange: "05-06",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="sponsor-left" pageNumber={5} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="sponsor-right" pageNumber={6} />,
    },
    {
      id: "spotlight",
      label: `Issue ${issueNumber} Spotlight Spread`,
      pageRange: "07-08",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="spotlight-left" pageNumber={7} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="spotlight-right" pageNumber={8} />,
    },
    {
      id: "polls-reviews",
      label: `Issue ${issueNumber} Polls Spread`,
      pageRange: "09-10",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="polls-left" pageNumber={9} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="polls-right" pageNumber={10} />,
    },
    {
      id: "archive",
      label: `Issue ${issueNumber} Archive Spread`,
      pageRange: "11-12",
      left: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="archive-left" pageNumber={11} />,
      right: <MagazineIssueSurface article={article} related={related} issueNumber={issueNumber} variant="archive-right" pageNumber={12} />,
    },
  ];

  return <MagazineBookShell spreads={spreads} initialSpread={initialSpread} coverSpreadIndex={0} />;
}