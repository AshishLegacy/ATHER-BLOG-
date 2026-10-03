export type UserRole = "ADMIN" | "AUTHOR" | "READER";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  bio?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  isBanned?: boolean;
}

export interface PostWithAuthorAndMeta {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  viewCount: number;
  readingTime: number;
  featured: boolean;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    role: UserRole;
  };
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  likes?: { userId: string }[];
  _count?: {
    comments: number;
    likes: number;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;
}

export interface CommentWithRepliesAndAuthor {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: UserRole;
  };
  replies?: CommentWithRepliesAndAuthor[];
}
