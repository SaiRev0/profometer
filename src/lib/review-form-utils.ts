import { ProfessorPercentages } from '@/lib/types';

// Helper function to get current year
export const getCurrentYear = () => new Date().getFullYear();

// Default professor ratings
export const getDefaultProfessorRatings = () => ({
  teaching: 0,
  helpfulness: 0,
  fairness: 0,
  clarity: 0,
  communication: 0
});

// Default course ratings
export const getDefaultCourseRatings = () => ({
  scoring: 0,
  engaging: 0,
  conceptual: 0,
  easyToLearn: 0
});

// Default statistics (same for both professor and course reviews)
export const getDefaultStatistics = (): ProfessorPercentages => ({
  wouldRecommend: -1,
  quizes: -1,
  assignments: -1,
  attendanceRating: 50
});

// Default semester
export const getDefaultSemester = () => `Odd-${getCurrentYear()}`;

// Types for the reset function setters
export interface ProfessorReviewFormSetters {
  setReviewRatings: (ratings: ReturnType<typeof getDefaultProfessorRatings>) => void;
  setReviewStatistics: (statistics: ProfessorPercentages) => void;
  setReviewComment: (comment: string) => void;
  setReviewCourse: (course: string) => void;
  setReviewSemester: (semester: string) => void;
  setReviewGrade: (grade: string) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setModalState: (state: boolean) => void;
}

export interface CourseReviewFormSetters {
  setReviewRatings: (ratings: ReturnType<typeof getDefaultCourseRatings>) => void;
  setReviewStatistics: (statistics: ProfessorPercentages) => void;
  setReviewComment: (comment: string) => void;
  setReviewProfessor: (professor: string) => void;
  setProfessorSearch: (search: string) => void;
  setReviewSemester: (semester: string) => void;
  setReviewGrade: (grade: string) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setModalState: (state: boolean) => void;
}

// Reset function for professor review form
export const resetProfessorReviewForm = (setters: ProfessorReviewFormSetters) => {
  setters.setReviewRatings(getDefaultProfessorRatings());
  setters.setReviewStatistics(getDefaultStatistics());
  setters.setReviewComment('');
  setters.setReviewCourse('');
  setters.setReviewSemester(getDefaultSemester());
  setters.setReviewGrade('');
  setters.setIsAnonymous(true);
  setters.setModalState(false);
};

// Reset function for course review form
export const resetCourseReviewForm = (setters: CourseReviewFormSetters) => {
  setters.setReviewRatings(getDefaultCourseRatings());
  setters.setReviewStatistics(getDefaultStatistics());
  setters.setReviewComment('');
  setters.setReviewProfessor('');
  setters.setProfessorSearch('');
  setters.setReviewSemester(getDefaultSemester());
  setters.setReviewGrade('');
  setters.setIsAnonymous(true);
  setters.setModalState(false);
};
