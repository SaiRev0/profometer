export interface Department {
    id: string;
    name: string;
    code: string;
    avgRating: number;
    numProfessors: number;
    numReviews: number;
}

export interface Professor {
    id: string;
    name: string;
    department: Department;
    image: string;
    position: string;
    yearsOfExperience: number;
    avgRating: number;
    numReviews: number;
    ratings: {
        teachingQuality: number;
        helpfulness: number;
        clarity: number;
        fairness: number;
        communication: number;
    };
}

export interface Review {
    id: string;
    professorId: string;
    userId: string;
    username?: string;
    isAnonymous: boolean;
    date: string;
    comment: string;
    ratings: {
        teachingQuality: number;
        helpfulness: number;
        clarity: number;
        fairness: number;
        communication: number;
        overall: number;
    };
    helpful: number;
    reported: boolean;
}
