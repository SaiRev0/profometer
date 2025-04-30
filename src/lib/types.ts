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
    wouldTakeAgain: number;
    difficultyLevel: number;
    attendanceMandatory: number;
    textbookRequired: number;
  };
  departments: {
    name: string;
    professors: number;
    averageRating: number;
  }[];
  tags: string[];
}

export interface Professor {
  id: string;
  name: string;
  department: string;
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
    attendanceMandatory: number;
    quizes: number;
    assignments: number;
  };
  tags: string[];
  courses: {
    code: string;
    name: string;
    reviewCount: number;
  }[];
}

export interface Review {
  id: string;
  userId: string;
  professorId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  anonymous: boolean;
  userName?: string;
  date: Date;
  ratings: {
    overall: number;
    teaching: number;
    helpfulness: number;
    fairness: number;
    clarity: number;
    communication: number;
  };
  comment: string;
  wouldRecommend?: boolean;
  quizes?: boolean;
  assignments?: boolean;
  attendance?: string;
  grade?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
}

export type SortOption = 'recent' | 'rating-high' | 'rating-low' | 'reviews' | 'name-asc' | 'name-desc';
