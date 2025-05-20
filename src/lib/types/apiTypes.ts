import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';

export interface CreateReviewApiData {
  professorId: string;
  courseCode: string;
  semester: string;
  anonymous: boolean;
  ratings: ProfessorRating | CourseRating;
  comment: string;
  statistics: ProfessorPercentages | CoursePercentages;
  grade?: string;
  type: 'professor' | 'course';
}
