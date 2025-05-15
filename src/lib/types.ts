export interface Department {
  name: string;
  code: string;
  avgRating: number;
  numProfessors: number;
  numReviews: number;
  numCourses: number;
  professors?: Professor[];
  courses?: Course[];
}
export interface Course {
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentId: string;
  department?: Department;
  professors?: Professor[];
  statistics: {
    ratings: {
      overall: number;
    };
    percentages: {
      wouldRecommend: number;
      averageGrade: string;
    };
    totalReviews: number;
  };
  reviews: Review[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface Professor {
  id: string;
  name: string;
  department: Department;
  designation: string;
  photoUrl: string;
  email: string;
  website: string;
  numReviews: number;
  numCourses: number;
  reviews: Review[];
  statistics: {
    ratings: {
      overall: number;
      teaching: number;
      helpfulness: number;
      fairness: number;
      clarity: number;
      communication: number;
    };
    percentages: {
      wouldRecommend: number;
      attendanceRating: number;
      quizes: number;
      assignments: number;
    };
    totalReviews: number;
  };
  courses?: Course[];
  departmentCourses?: Course[];
}
export interface Review {
  id: string;
  userId: string;
  professorId: string;
  courseId: string;
  semester: string;
  anonymous: boolean;
  ratings: {
    overall: number;
    teaching: number;
    helpfulness: number;
    fairness: number;
    clarity: number;
    communication: number;
  };
  comment: string;
  wouldRecommend: boolean;
  quizes: boolean;
  assignments: boolean;
  attendance: string;
  grade?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string | null;
    image: string | null;
  };
  course?: {
    code: string;
  };
}
export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  departmentCode: string;
  department: Department;
  reviews: Review[];
  statistics: {
    helpfulVotes: number;
    totalReviews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type SortOption = 'recent' | 'rating-high' | 'rating-low' | 'reviews' | 'name-asc' | 'name-desc';
