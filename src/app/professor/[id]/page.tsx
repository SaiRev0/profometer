import { notFound } from 'next/navigation';

import ProfessorDetails from '@/components/professor/professor-details';

// Mock professor data
const mockProfessor = {
    id: 'prof-1',
    name: 'Dr. Sarah Johnson',
    department: 'Computer Science',
    university: 'Tech University',
    photoUrl:
        'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    email: 'sjohnson@techuniversity.edu',
    officeHours: 'Mon, Wed 2-4 PM',
    website: 'https://techuniversity.edu/faculty/sjohnson',
    bio: 'Dr. Sarah Johnson is a Professor of Computer Science with a focus on artificial intelligence and machine learning. She received her Ph.D. from MIT and has been teaching for over 10 years.',
    ratings: {
        overall: 4.2,
        teaching: 4.3,
        helpfulness: 4.4,
        fairness: 4.1,
        clarity: 3.9,
        communication: 4.3
    },
    numReviews: 128,
    numCourses: 7,
    statistics: {
        wouldTakeAgain: 85,
        difficultyLevel: 3.7,
        attendanceMandatory: 62,
        textbookRequired: 45
    },
    tags: [
        'Clear Explanations',
        'Fair Grading',
        'Engaging',
        'Accessible',
        'Challenging',
        'Practical Assignments',
        'Inspirational',
        'Research Opportunities',
        'Industry Experience'
    ],
    courses: [
        { code: 'CS101', name: 'Introduction to Computer Science', reviewCount: 42 },
        { code: 'CS305', name: 'Data Structures and Algorithms', reviewCount: 36 },
        { code: 'CS412', name: 'Machine Learning', reviewCount: 28 },
        { code: 'CS450', name: 'Advanced AI Techniques', reviewCount: 14 },
        { code: 'CS501', name: 'Graduate Research Seminar', reviewCount: 8 }
    ]
};

// Mock reviews
const mockReviews = Array.from({ length: 10 }, (_, i) => ({
    id: `review-${i + 1}`,
    userId: `user-${i + 1}`,
    professorId: 'prof-1',
    courseCode: mockProfessor.courses[i % mockProfessor.courses.length].code,
    courseTitle: mockProfessor.courses[i % mockProfessor.courses.length].name,
    semester: ['Fall 2023', 'Spring 2023', 'Summer 2022', 'Fall 2022'][i % 4],
    anonymous: i % 3 === 0,
    userName: i % 3 === 0 ? undefined : ['Alex Smith', 'Jamie Lee', 'Taylor Wong', 'Jordan Rivera'][i % 4],
    date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000), // Days ago
    ratings: {
        overall: 3 + Math.random() * 2,
        teaching: 3 + Math.random() * 2,
        helpfulness: 3 + Math.random() * 2,
        fairness: 3 + Math.random() * 2,
        clarity: 3 + Math.random() * 2,
        communication: 3 + Math.random() * 2
    },
    comment: [
        "Professor Johnson is one of the best instructors I've had. She explains complex concepts in an accessible way and is always available during office hours. Her assignments are challenging but fair, and they really helped me understand the material.",
        "Very knowledgeable and passionate about the subject. Classes can be challenging but you'll learn a lot if you put in the effort. Grading is fair and feedback is constructive.",
        "Dr. Johnson's class was tough but rewarding. She has high expectations, but provides all the resources needed to succeed. The workload is heavy, but I learned more in this class than in most of my other courses combined.",
        'I appreciate that Dr. Johnson connects theoretical concepts to real-world applications. Her industry background adds a lot of value to the course. Assignments are practical and relevant.'
    ][i % 4],
    wouldTakeAgain: i % 5 !== 0,
    textbookRequired: i % 3 === 0,
    attendance: ['mandatory', 'optional', 'unknown'][i % 3] as 'mandatory' | 'optional' | 'unknown',
    grade: ['A', 'B+', 'B', 'C+', 'A-'][i % 5],
    tags: [
        ['Clear Explanations', 'Fair Grading', 'Engaging'],
        ['Tough Grader', 'Inspirational', 'Respected'],
        ['Accessible', 'Practical Assignments', 'Industry Experience'],
        ['Challenging', 'Theoretical Focus', 'Research Opportunities']
    ][i % 4],
    upvotes: Math.floor(Math.random() * 20),
    downvotes: Math.floor(Math.random() * 5),
    userVote: i % 7 === 0 ? 'up' : i % 11 === 0 ? 'down' : (null as 'up' | 'down' | null)
}));

// Generate static params for all professors
export function generateStaticParams() {
    // Include prof-1 through prof-9 to match all possible routes
    return [
        { id: 'prof-1' },
        ...Array.from({ length: 9 }, (_, i) => ({
            id: `prof-${i + 1}`
        }))
    ];
}

export default async function ProfessorPage({ params }: { params: { id: string } }) {
    // In a real application, fetch professor data based on the ID
    // For now, return mock data if ID matches, otherwise 404
    const { id } = await params;
    if (id !== 'prof-1') {
        notFound();
    }

    return <ProfessorDetails professor={mockProfessor} initialReviews={mockReviews} />;
}
