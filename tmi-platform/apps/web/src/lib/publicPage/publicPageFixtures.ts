/**
 * Gate C.2 fixtures. Test data only.
 * Do not seed these into runtime, Prisma, or public profiles.
 */

import {
  PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION,
  type PublicPageBlock,
  type PublicPageDocument,
  type PublicPageSection,
} from "./publicPageDocument";

const THEME = {
  accentColorHex: "#00FFFF",
  stylePackId: "tmi_classic",
  animationIntensity: "NORMAL" as const,
  fontPairingId: "INTER" as const,
};

const A11Y = {
  label: "Public page",
  reduceMotionSafe: true,
  semanticRole: "REGION" as const,
};

const RESPONSIVE = {
  mobileStrategy: "STACK_PRESERVE_ORDER" as const,
  magnetCollapse: "FLOW" as const,
  viewports: ["DESKTOP", "TABLET", "PHONE"] as Array<"DESKTOP" | "TABLET" | "PHONE">,
  phoneCertificationTarget: "390x844" as const,
};

function flowBounds(order: number) {
  return { x: 0, y: order, w: 12, h: 4, z: order, column: "FULL" as const };
}

function block(partial: PublicPageBlock): PublicPageBlock {
  return partial;
}

function shell(
  partial: Pick<PublicPageDocument, "documentId" | "ownerUserId" | "profileKind" | "sections"> &
    Partial<PublicPageDocument>,
): PublicPageDocument {
  return {
    schemaVersion: PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION,
    documentPurpose: "PUBLIC_PAGE",
    status: "DRAFT",
    publishedVersion: null,
    draftRevisionLabel: "draft-1",
    theme: THEME,
    responsiveRules: RESPONSIVE,
    a11y: A11Y,
    updatedAt: "2026-09-26T20:00:00.000Z",
    ...partial,
  };
}

function section(partial: PublicPageSection): PublicPageSection {
  return partial;
}

/** A. One sentence. No empty placeholder sections. */
export const FIXTURE_MINIMAL_FAN_PAGE: PublicPageDocument = shell({
  documentId: "doc_fan_min",
  ownerUserId: "user_fan_1",
  profileKind: "FAN",
  sections: [
    section({
      sectionId: "sec_primary",
      kind: "PRIMARY",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_poem",
          kind: "POEM",
          placement: "FLOW",
          bounds: flowBounds(0),
          style: { opacity: 1, backgroundTreatment: "NONE" },
          visibility: "PUBLIC",
          a11y: { label: "Poem", reduceMotionSafe: true, semanticRole: "ARTICLE" },
          plainText: { text: "One poem is a finished page." },
        }),
      ],
    }),
  ],
});

/** B. Same schema. One performer-gated booking block plus identity text. */
export const FIXTURE_MINIMAL_PERFORMER_PAGE: PublicPageDocument = shell({
  documentId: "doc_performer_min",
  ownerUserId: "user_performer_1",
  profileKind: "PERFORMER",
  sections: [
    section({
      sectionId: "sec_identity",
      kind: "IDENTITY",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_status",
          kind: "STATUS_LINE",
          placement: "FLOW",
          bounds: flowBounds(0),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Status", reduceMotionSafe: true },
          plainText: { text: "On stage tonight." },
        }),
      ],
    }),
    section({
      sectionId: "sec_booking",
      kind: "FOOTER_DOCK",
      order: 1,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_booking",
          kind: "BOOKING_CTA",
          placement: "FLOW",
          bounds: flowBounds(1),
          style: { skinRef: "tmi_classic" },
          visibility: "PUBLIC",
          a11y: { label: "Booking", reduceMotionSafe: true, semanticRole: "LINK" },
          bindingRef: {
            authority: "USER",
            recordId: "user_performer_1",
            snapshotPolicy: "LIVE_RESOLVE",
          },
        }),
      ],
    }),
  ],
});

/** C. Repeatable quotes, writing, photo, tracks, snip. */
export const FIXTURE_RICH_MULTIMEDIA_PAGE: PublicPageDocument = shell({
  documentId: "doc_rich",
  ownerUserId: "user_fan_2",
  profileKind: "FAN",
  sections: [
    section({
      sectionId: "sec_story",
      kind: "PRIMARY",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_quote_a",
          kind: "QUOTE",
          placement: "FLOW",
          bounds: flowBounds(0),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Quote one", reduceMotionSafe: true },
          plainText: { text: "First quote." },
        }),
        block({
          id: "blk_quote_b",
          kind: "QUOTE",
          placement: "FLOW",
          bounds: flowBounds(1),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Quote two", reduceMotionSafe: true },
          plainText: { text: "Second quote." },
        }),
        block({
          id: "blk_writing",
          kind: "LONG_FORM_WRITING",
          placement: "FLOW",
          bounds: flowBounds(2),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Note", reduceMotionSafe: true, semanticRole: "ARTICLE" },
          plainText: { text: "A longer piece of writing." },
        }),
        block({
          id: "blk_photo",
          kind: "PHOTO",
          placement: "FLOW",
          bounds: flowBounds(3),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Photograph", reduceMotionSafe: true, semanticRole: "IMG" },
          bindingRef: { authority: "CONTENT", recordId: "content_photo_1", snapshotPolicy: "PINNED_REVISION", pinnedRevisionLabel: "rev-4" },
        }),
        block({
          id: "blk_track_a",
          kind: "TRACK",
          placement: "FLOW",
          bounds: flowBounds(4),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Song one", reduceMotionSafe: true },
          bindingRef: { authority: "TRACK", recordId: "track_1", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_track_b",
          kind: "TRACK",
          placement: "FLOW",
          bounds: flowBounds(5),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Song two", reduceMotionSafe: true },
          bindingRef: { authority: "TRACK", recordId: "track_2", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_snip",
          kind: "VIDEO_SNIP",
          placement: "FLOW",
          bounds: flowBounds(6),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Snip", reduceMotionSafe: true },
          bindingRef: { authority: "CONTENT", recordId: "content_snip_1", snapshotPolicy: "LIVE_RESOLVE" },
        }),
      ],
    }),
  ],
});

/** D. Independent magnet instances. */
export const FIXTURE_FREEFORM_MAGNET_PAGE: PublicPageDocument = shell({
  documentId: "doc_magnets",
  ownerUserId: "user_fan_3",
  profileKind: "FAN",
  sections: [
    section({
      sectionId: "sec_canvas",
      kind: "CUSTOM",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_magnet_a",
          kind: "QUOTE",
          placement: "MAGNET",
          bounds: { x: 4, y: 8, w: 20, h: 12, z: 2, column: "L" },
          style: { opacity: 0.9, blurPx: 8, cornerRadiusPx: 12, backgroundTreatment: "GLASS" },
          visibility: "PUBLIC",
          a11y: { label: "Magnet quote", reduceMotionSafe: true },
          plainText: { text: "Placed freely." },
        }),
        block({
          id: "blk_magnet_b",
          kind: "HEADING",
          placement: "MAGNET",
          bounds: { x: 40, y: 6, w: 30, h: 8, z: 3, column: "R" },
          style: { sizeScale: "LG", weight: "BOLD" },
          visibility: "PUBLIC",
          a11y: { label: "Magnet heading", reduceMotionSafe: true },
          plainText: { text: "Another magnet." },
        }),
      ],
    }),
  ],
});

/** E. Desktop bounds plus mobile collapse declaration. */
export const FIXTURE_RESPONSIVE_PAGE: PublicPageDocument = shell({
  documentId: "doc_responsive",
  ownerUserId: "user_fan_4",
  profileKind: "FAN",
  responsiveRules: {
    mobileStrategy: "SECTION_TEMPLATES",
    magnetCollapse: "CAROUSEL_WITHIN_SECTION",
    viewports: ["DESKTOP", "PHONE"],
    phoneCertificationTarget: "390x844",
  },
  sections: [
    section({
      sectionId: "sec_hero",
      kind: "HERO",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_hero",
          kind: "HERO_BANNER",
          placement: "MAGNET",
          bounds: { x: 0, y: 0, w: 100, h: 40, z: 1, column: "FULL" },
          style: { backgroundTreatment: "GRADIENT", glowAccentRef: "#FF2DAA" },
          visibility: "PUBLIC",
          a11y: { label: "Hero", description: "Banner", reduceMotionSafe: true, semanticRole: "IMG" },
          plainText: { text: "Hero lives in the document, not in profile config." },
        }),
      ],
    }),
  ],
});

/** F. Bindings by id only. */
export const FIXTURE_CANONICAL_BINDING_PAGE: PublicPageDocument = shell({
  documentId: "doc_bindings",
  ownerUserId: "user_performer_2",
  profileKind: "PERFORMER",
  sections: [
    section({
      sectionId: "sec_bind",
      kind: "PRIMARY",
      order: 0,
      visibility: "PUBLIC",
      blocks: [
        block({
          id: "blk_playlist",
          kind: "PLAYLIST",
          placement: "FLOW",
          bounds: flowBounds(0),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Playlist", reduceMotionSafe: true },
          bindingRef: { authority: "PLAYLIST", recordId: "playlist_9", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_yopho",
          kind: "YOPHO",
          placement: "FLOW",
          bounds: flowBounds(1),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "YoPho", reduceMotionSafe: true },
          bindingRef: { authority: "YOPHO_CARD", recordId: "yopho_3", snapshotPolicy: "PINNED_REVISION", pinnedRevisionLabel: "edition-2" },
        }),
        block({
          id: "blk_live",
          kind: "LIVE_PRESENCE",
          placement: "FLOW",
          bounds: flowBounds(2),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Live", reduceMotionSafe: true },
          bindingRef: { authority: "LIVE_SESSION", recordId: "live_7", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_merch",
          kind: "MERCH_SHELF",
          placement: "FLOW",
          bounds: flowBounds(3),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Merch", reduceMotionSafe: true },
          bindingRef: { authority: "PRODUCT", recordId: "product_4", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_article",
          kind: "MAGAZINE_FEATURE",
          placement: "FLOW",
          bounds: flowBounds(4),
          style: {},
          visibility: "FRIENDS_ONLY",
          a11y: { label: "Feature", reduceMotionSafe: true },
          bindingRef: { authority: "ARTICLE", recordId: "article_8", snapshotPolicy: "LIVE_RESOLVE" },
        }),
        block({
          id: "blk_room",
          kind: "PUBLIC_ROOM",
          placement: "FLOW",
          bounds: flowBounds(5),
          style: {},
          visibility: "PUBLIC",
          a11y: { label: "Room", reduceMotionSafe: true },
          bindingRef: { authority: "PUBLIC_ROOM", recordId: "room_2", snapshotPolicy: "LIVE_RESOLVE" },
        }),
      ],
    }),
  ],
});

export const FIXTURE_INVALID_DOCUMENTS = {
  malformedId: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    documentId: "bad id",
  },
  unsupportedKind: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      {
        ...FIXTURE_MINIMAL_FAN_PAGE.sections[0],
        blocks: [{ ...FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0], kind: "NOT_A_KIND" }],
      },
    ],
  },
  malformedBounds: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      {
        ...FIXTURE_MINIMAL_FAN_PAGE.sections[0],
        blocks: [
          {
            ...FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0],
            bounds: { x: 0, y: 0, w: 0, h: 4, z: 0 },
          },
        ],
      },
    ],
  },
  invalidBindingAuthority: {
    ...FIXTURE_CANONICAL_BINDING_PAGE,
    sections: [
      {
        ...FIXTURE_CANONICAL_BINDING_PAGE.sections[0],
        blocks: [
          {
            ...FIXTURE_CANONICAL_BINDING_PAGE.sections[0].blocks[0],
            bindingRef: { authority: "GUESTBOOK", recordId: "x", snapshotPolicy: "LIVE_RESOLVE" },
          },
        ],
      },
    ],
  },
  emptyRecordId: {
    ...FIXTURE_CANONICAL_BINDING_PAGE,
    sections: [
      {
        ...FIXTURE_CANONICAL_BINDING_PAGE.sections[0],
        blocks: [
          {
            ...FIXTURE_CANONICAL_BINDING_PAGE.sections[0].blocks[0],
            bindingRef: { authority: "PLAYLIST", recordId: "  ", snapshotPolicy: "LIVE_RESOLVE" },
          },
        ],
      },
    ],
  },
  unsafeStyle: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      {
        ...FIXTURE_MINIMAL_FAN_PAGE.sections[0],
        blocks: [
          {
            ...FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0],
            style: { customCss: "body{background:url(javascript:alert(1))}" },
          },
        ],
      },
    ],
  },
  duplicateBlockIds: {
    ...FIXTURE_RICH_MULTIMEDIA_PAGE,
    sections: [
      {
        ...FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0],
        blocks: [
          FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0].blocks[0],
          { ...FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0].blocks[1], id: "blk_quote_a" },
        ],
      },
    ],
  },
  invalidVisibility: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      { ...FIXTURE_MINIMAL_FAN_PAGE.sections[0], visibility: "SECRET" },
    ],
  },
  invalidSchemaVersion: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    schemaVersion: 99,
  },
  guestbook: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      {
        ...FIXTURE_MINIMAL_FAN_PAGE.sections[0],
        blocks: [{ ...FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0], kind: "GUESTBOOK" }],
      },
    ],
  },
  customHtml: {
    ...FIXTURE_MINIMAL_FAN_PAGE,
    sections: [
      {
        ...FIXTURE_MINIMAL_FAN_PAGE.sections[0],
        blocks: [{ ...FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0], kind: "CUSTOM_HTML_SANDBOX" }],
      },
    ],
  },
} as const;
