export type PictureInPictureFeedType =
  | "artist"
  | "performer"
  | "fan"
  | "bot"
  | "host"
  | "venue"
  | "battle"
  | "cypher"
  | "ticketed-event"
  | "admin-camera";

export type PictureInPictureFeed = {
  feedId: string;
  label: string;
  route: string;
  type: PictureInPictureFeedType;
  cameraLabel: string;
  previewImage: string;
  live: boolean;
};

export type PictureInPictureWindow = {
  windowId: string;
  feedId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned: boolean;
  zIndex: number;
};

export type PictureInPictureState = {
  mainFeedId: string;
  windows: PictureInPictureWindow[];
};

function toWindow(feed: PictureInPictureFeed, index: number): PictureInPictureWindow {
  return {
    windowId: `pip-${feed.feedId}`,
    feedId: feed.feedId,
    label: feed.label,
    x: 18 + index * 26,
    y: 18 + index * 18,
    width: 210,
    height: 118,
    pinned: index === 0,
    zIndex: 20 + index,
  };
}

export function createPictureInPictureState(feeds: PictureInPictureFeed[], mainFeedId?: string): PictureInPictureState {
  const mainFeed = feeds.find((feed) => feed.feedId === mainFeedId) ?? feeds[0];
  const main = mainFeed?.feedId ?? "";
  return {
    mainFeedId: main,
    windows: feeds
      .filter((feed) => feed.feedId !== main)
      .slice(0, 4)
      .map((feed, index) => toWindow(feed, index)),
  };
}

export function swapPictureInPictureFocus(state: PictureInPictureState, focusFeedId: string, feeds: PictureInPictureFeed[]): PictureInPictureState {
  if (!focusFeedId || focusFeedId === state.mainFeedId) return state;

  const previousMain = feeds.find((feed) => feed.feedId === state.mainFeedId);
  const nextMain = feeds.find((feed) => feed.feedId === focusFeedId);
  if (!previousMain || !nextMain) return state;

  const retainedWindows = state.windows.filter((window) => window.feedId !== focusFeedId);
  const replacementWindow = toWindow(previousMain, retainedWindows.length);

  return {
    mainFeedId: focusFeedId,
    windows: [...retainedWindows, replacementWindow].map((window, index) => ({
      ...window,
      zIndex: 20 + index,
    })),
  };
}

export function dragPictureInPictureWindow(
  state: PictureInPictureState,
  windowId: string,
  position: { x: number; y: number },
): PictureInPictureState {
  return {
    ...state,
    windows: state.windows.map((window) =>
      window.windowId === windowId
        ? {
            ...window,
            x: Math.max(0, position.x),
            y: Math.max(0, position.y),
            zIndex: Math.max(...state.windows.map((entry) => entry.zIndex), 20) + 1,
          }
        : window,
    ),
  };
}

export function pinPictureInPictureWindow(state: PictureInPictureState, windowId: string): PictureInPictureState {
  return {
    ...state,
    windows: state.windows.map((window) =>
      window.windowId === windowId
        ? { ...window, pinned: !window.pinned }
        : window,
    ),
  };
}

export function resizePictureInPictureWindow(
  state: PictureInPictureState,
  windowId: string,
  size: { width: number; height: number },
): PictureInPictureState {
  return {
    ...state,
    windows: state.windows.map((window) =>
      window.windowId === windowId
        ? {
            ...window,
            width: Math.max(160, size.width),
            height: Math.max(90, size.height),
          }
        : window,
    ),
  };
}