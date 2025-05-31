// Mock data for branches
export const departments = [
  {
    id: 'APD',
    name: 'Architecture, Planning and Design',
    code: 'APD',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'CER',
    name: 'Ceramic Engineering',
    code: 'CER',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'CHE',
    name: 'Chemical Engineering and Technology',
    code: 'CHE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'CIV',
    name: 'Civil Engineering',
    code: 'CIV',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'CSE',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'EEE',
    name: 'Electrical Engineering',
    code: 'EEE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'ECE',
    name: 'Electronics Engineering',
    code: 'ECE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'MEC',
    name: 'Mechanical Engineering',
    code: 'MEC',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'MET',
    name: 'Metallurgical Engineering',
    code: 'MET',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'MIN',
    name: 'Mining Engineering',
    code: 'MIN',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'PHE',
    name: 'Pharmaceutical Engineering and Technology',
    code: 'PHE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'CHY',
    name: 'Chemistry',
    code: 'CHY',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'MAT',
    name: 'Mathematical Sciences',
    code: 'MAT',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'PHY',
    name: 'Physics',
    code: 'PHY',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'BCE',
    name: 'Biochemical Engineering',
    code: 'BCE',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'BME',
    name: 'Biomedical Engineering',
    code: 'BME',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'MST',
    name: 'Materials Science and Technology',
    code: 'MST',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  {
    id: 'HS',
    name: 'Humanistic Studies',
    code: 'HS',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  }
];

// Mock data for the professors
// export const mockProfessors: Professor[] = Array.from({ length: 20 }, (_, i) => ({
//   id: `prof-${i + 1}`,
//   name: [
//     'Dr. Sarah Johnson',
//     'Prof. Michael Williams',
//     'Dr. Emily Chen',
//     'Prof. James Smith',
//     'Dr. Olivia Martinez',
//     'Prof. David Wilson',
//     'Dr. Emma Brown',
//     'Prof. Robert Lee',
//     'Dr. Sophia Garcia',
//     'Prof. Thomas Anderson'
//   ][i % 10],
//   department: departments[i % departments.length].name,
//   branch: ['CS', 'ENG', 'BUS', 'PHY', 'MATH'][i % 5],
//   rating: 2 + Math.random() * 3,
//   numReviews: 10 + Math.floor(Math.random() * 190),
//   difficultyLevel: 2 + Math.random() * 3,
//   imageUrl: [
//     'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg',
//     'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg',
//     'https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg',
//     'https://images.pexels.com/photos/5905521/pexels-photo-5905521.jpeg'
//   ][i % 4],
//   topReview: {
//     rating: 3 + Math.random() * 2,
//     comment: [
//       'Very knowledgeable professor who challenges students to think deeply about the material.',
//       "Excellent at explaining complex concepts in a way that's easy to understand.",
//       "Tough but fair. Expect to work hard but you'll learn a lot in this class.",
//       'Always available during office hours and genuinely cares about student success.'
//     ][i % 4]
//   }
// }));

// Mock professor data
export const mockProfessor = {
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
  courses: [
    { code: 'CS101', name: 'Introduction to Computer Science', reviewCount: 42 },
    { code: 'CS305', name: 'Data Structures and Algorithms', reviewCount: 36 },
    { code: 'CS412', name: 'Machine Learning', reviewCount: 28 },
    { code: 'CS450', name: 'Advanced AI Techniques', reviewCount: 14 },
    { code: 'CS501', name: 'Graduate Research Seminar', reviewCount: 8 }
  ]
};

// Mock reviews
export const mockReviews = Array.from({ length: 10 }, (_, i) => ({
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
  upvotes: Math.floor(Math.random() * 20),
  downvotes: Math.floor(Math.random() * 5),
  userVote: i % 7 === 0 ? 'up' : i % 11 === 0 ? 'down' : (null as 'up' | 'down' | null)
}));

// Mock branch data for Computer Science
export const mockBranchData = {
  name: 'Computer Science',
  description:
    'Computer Science is the study of computers and computational systems, including theory, development, design, and application. This branch covers algorithms, data structures, programming languages, computer architecture, artificial intelligence, and more.',
  totalProfessors: 42,
  totalReviews: 1248,
  averageRating: 4.2,
  statistics: {
    wouldRecommend: 82,
    attendanceMandatory: 65,
    quizes: 55,
    assignments: 55
  },
  departments: [
    { name: 'Software Engineering', professors: 14, averageRating: 4.3 },
    { name: 'Data Science', professors: 9, averageRating: 4.5 },
    { name: 'Artificial Intelligence', professors: 8, averageRating: 4.0 },
    { name: 'Computer Systems', professors: 7, averageRating: 3.9 },
    { name: 'Theoretical Computer Science', professors: 4, averageRating: 3.7 }
  ]
};

export function getDepartmentsByRating() {
  return [...departments].sort((a, b) => b.avgRating - a.avgRating);
}
