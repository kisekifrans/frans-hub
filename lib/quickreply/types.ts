export interface QuickReply {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  favorite: boolean;
}

export interface QuickReplyStore {
  version: 1;
  snippets: QuickReply[];
  customCategories: string[];
  recentIds: string[];
}

export type SidebarFilter =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "pinned" }
  | { type: "recent" }
  | { type: "category"; category: string };

export interface QuickReplyDraft {
  title: string;
  category: string;
  content: string;
  pinned: boolean;
  favorite: boolean;
}
