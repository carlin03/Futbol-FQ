export type { ForumComment, ForumPost } from '../services/database'
export {
  fetchForumPosts as getForumPosts,
  addForumPost,
  toggleForumLike as toggleLike,
  addForumComment as addComment,
  deleteForumPost as deletePost,
} from '../services/database'
