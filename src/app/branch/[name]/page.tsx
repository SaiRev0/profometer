"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Users,
  Star,
  Filter,
  ArrowUpDown,
  BookmarkX,
  BookCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProfessorCard, { Professor } from "@/components/cards/professor-card";
import FilterDropdown, { SortOption, FilterOption } from "@/components/filters/filter-dropdown";
import RatingStars from "@/components/ui/rating-stars";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// List of available branches for static generation
const availableBranches = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Physics",
  "Mathematics",
  "Biology",
  "Chemistry"
];

export function generateStaticParams() {
  return availableBranches.map((branch) => ({
    name: branch.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Mock data for the branch
interface BranchData {
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

// Mock professors data
const mockProfessors: Professor[] = Array.from({ length: 24 }, (_, i) => ({
  id: `prof-branch-${i + 1}`,
  name: [
    "Dr. Sarah Johnson",
    "Prof. Michael Williams",
    "Dr. Emily Chen",
    "Prof. James Smith",
    "Dr. Olivia Martinez",
    "Prof. David Wilson",
    "Dr. Emma Brown",
    "Prof. Robert Lee",
    "Dr. Sophia Garcia",
    "Prof. Thomas Anderson",
    "Dr. Ava Robinson",
    "Prof. William Taylor"
  ][i % 12],
  department: "Computer Science",
  branch: "Computer Science",
  rating: 2 + Math.random() * 3,
  numReviews: 10 + Math.floor(Math.random() * 190),
  tags: [
    ["Clear Explanations", "Fair Grading", "Engaging"],
    ["Tough Grader", "Inspirational", "Respected"],
    ["Accessible", "Practical Assignments", "Industry Experience"],
    ["Challenging", "Theoretical Focus", "Research Opportunities"],
  ][i % 4],
  topReview: {
    rating: 3 + Math.random() * 2,
    comment: [
      "Very knowledgeable professor who challenges students to think deeply about the material.",
      "Excellent at explaining complex concepts in a way that's easy to understand.",
      "Tough but fair. Expect to work hard but you'll learn a lot in this class.",
      "Always available during office hours and genuinely cares about student success.",
    ][i % 4],
  },
}));

// Mock branch data for Computer Science
const mockBranchData: BranchData = {
  name: "Computer Science",
  description: "Computer Science is the study of computers and computational systems, including theory, development, design, and application. This branch covers algorithms, data structures, programming languages, computer architecture, artificial intelligence, and more.",
  totalProfessors: 42,
  totalReviews: 1248,
  averageRating: 4.2,
  statistics: {
    wouldTakeAgain: 82,
    difficultyLevel: 3.8,
    attendanceMandatory: 65,
    textbookRequired: 55,
  },
  departments: [
    { name: "Software Engineering", professors: 14, averageRating: 4.3 },
    { name: "Data Science", professors: 9, averageRating: 4.5 },
    { name: "Artificial Intelligence", professors: 8, averageRating: 4.0 },
    { name: "Computer Systems", professors: 7, averageRating: 3.9 },
    { name: "Theoretical Computer Science", professors: 4, averageRating: 3.7 },
  ],
  tags: [
    "Programming",
    "Algorithms",
    "Data Structures",
    "Machine Learning",
    "Web Development",
    "Cybersecurity",
    "Database Systems",
    "Operating Systems",
    "Computer Vision"
  ],
};

function BranchPageClient({ branch, professors: initialProfessors }: { branch: BranchData, professors: Professor[] }) {
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors);
  const [sortOption, setSortOption] = useState<SortOption>("rating-high");
  const [filters, setFilters] = useState<FilterOption>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // Filter and sort professors
  const filteredProfessors = professors
    .filter(prof => {
      if (filters.department && prof.department !== filters.department) {
        return false;
      }
      if (filters.minRating && prof.rating < filters.minRating) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "rating-high") {
        return b.rating - a.rating;
      } else if (sortOption === "rating-low") {
        return a.rating - b.rating;
      } else if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOption === "reviews") {
        return b.numReviews - a.numReviews;
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProfessors.length / pageSize);
  const paginatedProfessors = filteredProfessors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Branch Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {branch.name}
                </span>
              </CardTitle>
              <CardDescription>
                {branch.totalProfessors} professors • {branch.totalReviews} reviews
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="text-lg px-3 py-1" variant={
                branch.averageRating >= 4 ? "default" :
                branch.averageRating <= 3 ? "destructive" :
                "secondary"
              }>
                {branch.averageRating.toFixed(1)}
              </Badge>
              <RatingStars value={branch.averageRating} size="sm" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Professors</p>
                  <p className="text-2xl font-bold">{branch.totalProfessors}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-chart-1/5 border-chart-1/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <BookCheck className="h-6 w-6 text-chart-1 mb-2" />
                  <p className="text-sm font-medium">Would Take Again</p>
                  <p className="text-2xl font-bold">{branch.statistics.wouldTakeAgain}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-chart-2/5 border-chart-2/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <ArrowUpDown className="h-6 w-6 text-chart-2 mb-2" />
                  <p className="text-sm font-medium">Difficulty</p>
                  <p className="text-2xl font-bold">{branch.statistics.difficultyLevel.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-chart-3/5 border-chart-3/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <BookmarkX className="h-6 w-6 text-chart-3 mb-2" />
                  <p className="text-sm font-medium">Textbook Required</p>
                  <p className="text-2xl font-bold">{branch.statistics.textbookRequired}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-muted-foreground mb-6">
            {branch.description}
          </p>

          <div>
            <h3 className="text-base font-medium mb-2">Departments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {branch.departments.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-2 rounded-md border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => setFilters({ ...filters, department: dept.name })}
                >
                  <span className="text-sm font-medium">{dept.name}</span>
                  <Badge variant="outline">
                    {dept.averageRating.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-base font-medium mb-2">Popular Topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {branch.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professors List */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {branch.name} Professors
          </h2>

          <FilterDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
            filters={filters}
            onFilterChange={setFilters}
            departments={branch.departments.map(d => d.name)}
            variant="outline"
          />
        </div>

        {filteredProfessors.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No professors found with the selected filters.</p>
              <Button onClick={() => setFilters({})}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedProfessors.map((professor) => (
                <ProfessorCard
                  key={professor.id}
                  professor={professor}
                  variant="detailed"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function BranchPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name.replace(/-/g, ' '));

  // Update branch data with the correct name
  const branchData = { ...mockBranchData, name: decodedName };

  // Update professors with the correct branch
  const updatedProfessors = mockProfessors.map(prof => ({
    ...prof,
    branch: decodedName,
  }));

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/branches">
            <ChevronLeft className="h-4 w-4" />
            All Branches
          </Link>
        </Button>
      </div>

      <BranchPageClient branch={branchData} professors={updatedProfessors} />
    </div>
  );
}