export type TmiMagazinePageType = "cover" | "spread" | "article";

export interface TmiMagazinePageMeta {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  pageType: TmiMagazinePageType;
  backgroundImage?: string;
  accent?: "cyan" | "fuchsia" | "gold" | "emerald" | "violet";
  tags?: string[];
}

export interface TmiMagazineIssueMeta {
  issueId: string;
  issueTitle: string;
  pages: TmiMagazinePageMeta[];
}

export const TMI_HOME_MAGAZINE_ISSUE: TmiMagazineIssueMeta = {
  issueId: "home-issue-1",
  issueTitle: "Homepage Issue 1",
  pages: [
    {
      id: "home-1-cover",
      route: "/home/1",
      title: "Home 1 Cover",
      subtitle: "Closed magazine cover",
      pageType: "cover",
      accent: "cyan",
      tags: ["home", "cover", "issue"],
    },
    {
      id: "home-1-2-spread",
      route: "/home/1-2",
      title: "Home 1-2 Spread",
      subtitle: "Opening spread",
      pageType: "spread",
      backgroundImage: "/ui/magazine/home-1-2-spread.jpg",
      accent: "fuchsia",
      tags: ["home", "spread", "issue"],
    },
  ],
};

export function getPageMetaByRoute(
  issue: TmiMagazineIssueMeta,
  route: string
): TmiMagazinePageMeta | undefined {
  return issue.pages.find((p) => p.route === route);
}
