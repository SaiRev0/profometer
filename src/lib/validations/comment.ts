import { z } from 'zod';

export const createCommentSchema = z.object({
  reviewId: z.string().cuid('Invalid review ID'),
  parentId: z.string().cuid('Invalid parent comment ID').optional().nullable(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment too long (max 2000 characters)')
    .trim()
    .refine((val) => val.length > 0, 'Comment cannot be empty after trimming')
});

export const editCommentSchema = z.object({
  commentId: z.string().cuid('Invalid comment ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long (max 2000 characters)').trim()
});

export const reportCommentSchema = z.object({
  commentId: z.string().cuid('Invalid comment ID'),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other'], {
    message: 'Invalid report reason'
  }),
  details: z.string().max(500, 'Details too long (max 500 characters)').optional()
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type ReportCommentInput = z.infer<typeof reportCommentSchema>;
