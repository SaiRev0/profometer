export interface Department {
  id: string;
  name: string;
  code: string;
  avgRating: number;
  numProfessors: number;
  numReviews: number;
}
export interface Branch {
  name: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommit: {
    message: string;
    date: string;
    hash: string;
    author: {
      name: string;
      avatar: string;
    };
  };
  aheadBy: number;
  behindBy: number;
}

// Mock data for the branch
export interface BranchData {
  name: string;
  description: string;
  totalProfessors: number;
  totalReviews: number;
  averageRating: number;
  statistics: {
    wouldRecommend: number;
    attendanceMandatory: number;
    quizes: number;
    assignments: number;
  };
  departments: {
    name: string;
    professors: number;
    averageRating: number;
  }[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professorId: string;
  reviews: Review[];
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professor {
  id: string;
  name: string;
  department: Department;
  designation: string;
  photoUrl?: string;
  email?: string;
  website?: string;
  ratings: {
    overall: number;
    teaching: number;
    helpfulness: number;
    fairness: number;
    clarity: number;
    communication: number;
  };
  numReviews: number;
  numCourses: number;
  reviews: Review[];
  statistics: {
    wouldRecommend: number;
    attendanceRating: number;
    quizes: number;
    assignments: number;
  };
  courses: Course[];
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
}

export type SortOption = 'recent' | 'rating-high' | 'rating-low' | 'reviews' | 'name-asc' | 'name-desc';
