export interface CourseRating {
  overall: number;
  scoring: number;
  engaging: number;
  conceptual: number;
  easyToLearn: number;
}
export interface CoursePercentages {
  wouldRecommend: number;
  attendanceRating: number;
  quizes: number;
  assignments: number;
  averageGrade: string;
}
export interface ProfessorRating {
  overall: number;
  teaching: number;
  helpfulness: number;
  fairness: number;
  clarity: number;
  communication: number;
}
export interface ProfessorPercentages {
  wouldRecommend: number;
  attendanceRating: number;
  quizes: number;
  assignments: number;
}
export interface Department {
  name: string;
  code: string;
  avgRating: number;
  numReviews: number;
  professors?: Professor[];
  courses?: Course[];
  _count?: {
    professors: number;
    courses: number;
  };
}
export interface Course {
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentCode: string;
  department?: Department;
  professors?: Professor[];
  statistics: {
    ratings: CourseRating;
    percentages: CoursePercentages;
    totalReviews: number;
  };
  reviews: CourseReview[];
  verified: boolean;
  totalProfessors: number;
}
export interface Professor {
  id: string;
  name: string;
  departmentCode: string;
  department: Department;
  designation: string;
  photoUrl: string;
  email: string;
  website: string;
  // numReviews: number;
  // numCourses: number;
  reviews: ProfessorReview[];
  statistics: {
    ratings: ProfessorRating;
    percentages: ProfessorPercentages;
    totalReviews: number;
  };
  courses?: Course[];
  departmentCourses?: Course[];
  totalCourses: number;
}
interface Review {
  id: string;
  userId: string;
  professorId: string;
  professor?: Professor;
  courseCode: string;
  semester: string;
  anonymous: boolean;
  comment: string;
  grade?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  course: Course;
}
export interface CourseReview extends Review {
  type: 'course';
  ratings: CourseRating;
  statistics: CoursePercentages;
}
export interface ProfessorReview extends Review {
  type: 'professor';
  ratings: ProfessorRating;
  statistics: ProfessorPercentages;
}
export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  departmentCode: string;
  department: Department;
  reviews: (ProfessorReview | CourseReview)[];
  statistics: {
    helpfulVotes: number;
    totalReviews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type SortOption = 'recent' | 'rating-high' | 'rating-low' | 'reviews' | 'name-asc' | 'name-desc';
