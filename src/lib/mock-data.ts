import { Professor } from '@/components/cards/professor-card';

import { Department } from './types';

// Mock data for branches
export const departments: Department[] = [
    {
        id: 'd1',
        name: 'Computer Science and Engineering',
        code: 'CSE',
        avgRating: 4.2,
        numProfessors: 32,
        numReviews: 428
    },
    {
        id: 'd2',
        name: 'Electrical Engineering',
        code: 'EEE',
        avgRating: 3.9,
        numProfessors: 45,
        numReviews: 371
    },
    {
        id: 'd3',
        name: 'Mechanical Engineering',
        code: 'ME',
        avgRating: 4.0,
        numProfessors: 38,
        numReviews: 305
    },
    {
        id: 'd4',
        name: 'Civil Engineering',
        code: 'CE',
        avgRating: 3.7,
        numProfessors: 41,
        numReviews: 289
    },
    {
        id: 'd5',
        name: 'Chemical Engineering',
        code: 'CHE',
        avgRating: 4.1,
        numProfessors: 29,
        numReviews: 198
    },
    {
        id: 'd6',
        name: 'Metallurgical Engineering',
        code: 'MT',
        avgRating: 3.8,
        numProfessors: 33,
        numReviews: 176
    },
    {
        id: 'd7',
        name: 'Electronics Engineering',
        code: 'ECE',
        avgRating: 4.3,
        numProfessors: 36,
        numReviews: 412
    },
    {
        id: 'd8',
        name: 'Mathematics',
        code: 'MATH',
        avgRating: 3.5,
        numProfessors: 27,
        numReviews: 310
    },
    {
        id: 'd9',
        name: 'Physics',
        code: 'PHY',
        avgRating: 3.6,
        numProfessors: 23,
        numReviews: 244
    }
];

// Mock data for the professors
export const mockProfessors: Professor[] = Array.from({ length: 20 }, (_, i) => ({
    id: `prof-${i + 1}`,
    name: [
        'Dr. Sarah Johnson',
        'Prof. Michael Williams',
        'Dr. Emily Chen',
        'Prof. James Smith',
        'Dr. Olivia Martinez',
        'Prof. David Wilson',
        'Dr. Emma Brown',
        'Prof. Robert Lee',
        'Dr. Sophia Garcia',
        'Prof. Thomas Anderson'
    ][i % 10],
    department: ['Computer Science', 'Engineering', 'Business', 'Physics', 'Mathematics'][i % 5],
    branch: ['CS', 'ENG', 'BUS', 'PHY', 'MATH'][i % 5],
    rating: 2 + Math.random() * 3,
    numReviews: 10 + Math.floor(Math.random() * 190),
    difficultyLevel: 2 + Math.random() * 3,
    imageUrl: [
        'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg',
        'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg',
        'https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg',
        'https://images.pexels.com/photos/5905521/pexels-photo-5905521.jpeg'
    ][i % 4],
    tags: [
        ['Clear Explanations', 'Fair Grading', 'Engaging'],
        ['Tough Grader', 'Inspirational', 'Respected'],
        ['Accessible', 'Practical Assignments', 'Industry Experience'],
        ['Challenging', 'Theoretical Focus', 'Research Opportunities']
    ][i % 4],
    topReview: {
        rating: 3 + Math.random() * 2,
        comment: [
            'Very knowledgeable professor who challenges students to think deeply about the material.',
            "Excellent at explaining complex concepts in a way that's easy to understand.",
            "Tough but fair. Expect to work hard but you'll learn a lot in this class.",
            'Always available during office hours and genuinely cares about student success.'
        ][i % 4]
    }
}));

export function getDepartmentsByRating() {
    return [...departments].sort((a, b) => b.avgRating - a.avgRating);
}
