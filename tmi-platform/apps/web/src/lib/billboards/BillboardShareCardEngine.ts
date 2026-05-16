import { getBillboardBySlug } from "@/lib/billboards/BillboardRegistry";

export interface BillboardShareCard {
  title: string;
  description: string;
  image: string;
  canonicalUrl: string;
  shareLinks: {
    x: string;
    facebook: string;
    whatsapp: string;
    copy: string;
  };
}

const ROOT = "https://bernoutglobal.com";

function shareUrl(path: string): string {
  return `${ROOT}${path}`;
}

export class BillboardShareCardEngine {
  static build(slug: string): BillboardShareCard | null {
    const billboard = getBillboardBySlug(slug);
    if (!billboard) return null;

    const canonicalUrl = shareUrl(`/billboards/${billboard.slug}`);
    const encodedUrl = encodeURIComponent(canonicalUrl);
    const encodedTitle = encodeURIComponent(billboard.seoTitle);

    return {
      title: billboard.seoTitle,
      description: billboard.seoDescription,
      image: shareUrl(billboard.mediaAsset),
      canonicalUrl,
      shareLinks: {
        x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        copy: canonicalUrl,
      },
    };
  }
}

export default BillboardShareCardEngine;
