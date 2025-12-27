import { z } from 'zod';

const professorRatingSchema = z.object({
  overall: z.number().min(0).max(5),
  teaching: z.number().min(0).max(5),
  helpfulness: z.number().min(0).max(5),
  fairness: z.number().min(0).max(5),
  clarity: z.number().min(0).max(5),
  communication: z.number().min(0).max(5)
});

const courseRatingSchema = z.object({
  overall: z.number().min(0).max(5),
  scoring: z.number().min(0).max(5),
  engaging: z.number().min(0).max(5),
  conceptual: z.number().min(0).max(5),
  easyToLearn: z.number().min(0).max(5)
});

const percentageSchema = z.object({
  wouldRecommend: z.boolean(),
  attendanceRating: z.number().min(0).max(100),
  quizes: z.boolean(),
  assignments: z.boolean()
});

export const createReviewSchema = z.object({
  professorId: z.string().cuid('Invalid professor ID'),
  courseCode: z.string().regex(/^[A-Z]{2,5}\d{3,4}$/, 'Invalid course code format'),
  semester: z.string().regex(/^(Spring|Fall|Summer|Winter)\s\d{4}$/, 'Invalid semester format'),
  ratings: z.union([professorRatingSchema, courseRatingSchema]),
  comment: z
    .string()
    .min(50, 'Review must be at least 50 characters')
    .max(5000, 'Review too long (max 5000 characters)')
    .trim(),
  statistics: percentageSchema,
  grade: z
    .string()
    .regex(/^[A-F][+-]?$/)
    .optional()
    .nullable(),
  type: z.enum(['professor', 'course'])
});

export const reportReviewSchema = z.object({
  reviewId: z.string().cuid('Invalid review ID'),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other'], {
    message: 'Invalid report reason'
  }),
  details: z.string().max(500, 'Details too long (max 500 characters)').optional()
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
