import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';

export interface CreateReviewApiData {
  professorId: string;
  courseCode: string;
  semester: string;
  ratings: ProfessorRating | CourseRating;
  comment: string;
  statistics: ProfessorPercentages | CoursePercentages;
  grade?: string;
  type: 'professor' | 'course';
}

// Create a comment - much simpler than CreateReviewApiData (text only)
export interface CreateCommentApiData {
  reviewId: string;
  parentId?: string; // Optional - for replying to another comment
  content: string;
}

// Edit a comment
export interface EditCommentApiData {
  commentId: string;
  content: string;
}

// Vote on a comment
export interface CommentVoteApiData {
  commentId: string;
  voteType: 'up' | 'down';
}

// Report a comment
export interface ReportCommentApiData {
  commentId: string;
  reason: string;
  details?: string;
}
