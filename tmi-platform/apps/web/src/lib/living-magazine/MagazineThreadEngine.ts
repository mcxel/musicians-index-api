// MagazineThreadEngine
// Reddit-style threaded comments per article/spread.

export interface ThreadPost {
  id: string;
  parentId: string | null;
  authorId: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replyCount: number;
  hidden: boolean;
  flagged: boolean;
}

export interface Thread {
  id: string;
  articleId?: string;
  spreadIndex?: number;
  issueId?: string;
  posts: ThreadPost[];
  totalPosts: number;
  locked: boolean;
  accentColor: string;
}

export function createThread(
  id: string,
  options: Partial<Thread> = {},
): Thread {
  return {
    id,
    posts: [],
    totalPosts: 0,
    locked: false,
    accentColor: "#00FFFF",
    ...options,
  };
}

export function addPost(
  thread: Thread,
  id: string,
  authorId: string,
  body: string,
  parentId: string | null = null,
): Thread {
  if (thread.locked) return thread;

  const post: ThreadPost = {
    id,
    parentId,
    authorId,
    body,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    replyCount: 0,
    hidden: false,
    flagged: false,
  };

  const updatedPosts = thread.posts.map(p =>
    p.id === parentId ? { ...p, replyCount: p.replyCount + 1 } : p,
  );

  return {
    ...thread,
    posts: [...updatedPosts, post],
    totalPosts: thread.totalPosts + 1,
  };
}

export function votePost(
  thread: Thread,
  postId: string,
  direction: "up" | "down",
): Thread {
  const posts = thread.posts.map(p => {
    if (p.id !== postId) return p;
    return direction === "up"
      ? { ...p, upvotes: p.upvotes + 1 }
      : { ...p, downvotes: p.downvotes + 1 };
  });
  return { ...thread, posts };
}

export function getRootPosts(thread: Thread): ThreadPost[] {
  return thread.posts.filter(p => !p.parentId && !p.hidden);
}

export function getReplies(thread: Thread, parentId: string): ThreadPost[] {
  return thread.posts.filter(p => p.parentId === parentId && !p.hidden);
}
