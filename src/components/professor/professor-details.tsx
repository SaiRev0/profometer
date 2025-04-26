"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Star,
  Mail,
  ExternalLink,
  Building,
  BookOpen,
  Calendar,
  BarChart4,
  ClipboardList,
  Filter
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import RatingStars from "@/components/ui/rating-stars";
import ReviewCard, { Review } from "@/components/cards/review-card";
import FilterDropdown, { SortOption } from "@/components/filters/filter-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Professor {
  id: string;
  name: string;
  department: string;
  university: string;
  photoUrl?: string;
  email?: string;
  officeHours?: string;
  website?: string;
  bio?: string;
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
  statistics: {
    wouldTakeAgain: number;
    difficultyLevel: number;
    attendanceMandatory: number;
    textbookRequired: number;
  };
  tags: string[];
  courses: {
    code: string;
    name: string;
    reviewCount: number;
  }[];
}

interface ProfessorDetailsProps {
  professor: Professor;
  initialReviews: Review[];
}

export default function ProfessorDetails({ professor, initialReviews }: ProfessorDetailsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [reviewRatings, setReviewRatings] = useState({
    teaching: 0,
    helpfulness: 0,
    fairness: 0,
    clarity: 0,
    communication: 0,
  });
  const [reviewComment, setReviewComment] = useState("");
  const [reviewCourse, setReviewCourse] = useState("");
  const [reviewSemester, setReviewSemester] = useState("");
  const [reviewGrade, setReviewGrade] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [wouldTakeAgain, setWouldTakeAgain] = useState<boolean | undefined>(undefined);
  const [textbookRequired, setTextbookRequired] = useState<boolean | undefined>(undefined);
  const [attendanceMandatory, setAttendanceMandatory] = useState<string | undefined>(undefined);

  // Calculate overall rating from all other ratings
  const calculateOverallRating = () => {
    const values = Object.values(reviewRatings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return values.every(val => val > 0) ? sum / values.length : 0;
  };

  // Submit review function
  const handleSubmitReview = () => {
    // Check if all ratings are provided
    if (Object.values(reviewRatings).some(rating => rating === 0)) {
      toast({
        title: "Missing Ratings",
        description: "Please provide ratings for all categories.",
        variant: "destructive",
      });
      return;
    }

    // Check if comment is provided
    if (!reviewComment.trim()) {
      toast({
        title: "Missing Comment",
        description: "Please provide a written review.",
        variant: "destructive",
      });
      return;
    }

    // Check if course is selected
    if (!reviewCourse) {
      toast({
        title: "Missing Course",
        description: "Please select the course you took with this professor.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the review data
    const newReview: Review = {
      id: `review-new-${Date.now()}`,
      userId: "current-user",
      professorId: professor.id,
      courseCode: reviewCourse,
      courseTitle: professor.courses.find(c => c.code === reviewCourse)?.name || "",
      semester: reviewSemester,
      anonymous: isAnonymous,
      userName: isAnonymous ? undefined : "Current User",
      date: new Date(),
      ratings: {
        overall: calculateOverallRating(),
        ...reviewRatings,
      },
      comment: reviewComment,
      wouldTakeAgain,
      textbookRequired,
      attendance: attendanceMandatory as "mandatory" | "optional" | "unknown" | undefined,
      grade: reviewGrade || undefined,
      tags: [],
      upvotes: 0,
      downvotes: 0,
    };

    // Add the review to the list
    setReviews(prev => [newReview, ...prev]);

    // Close the form and show success notification
    setReviewFormOpen(false);

    toast({
      title: "Review Submitted!",
      description: "Thank you for sharing your experience.",
    });

    // Reset form
    setReviewRatings({
      teaching: 0,
      helpfulness: 0,
      fairness: 0,
      clarity: 0,
      communication: 0,
    });
    setReviewComment("");
    setReviewCourse("");
    setReviewSemester("");
    setReviewGrade("");
    setIsAnonymous(true);
    setWouldTakeAgain(undefined);
    setTextbookRequired(undefined);
    setAttendanceMandatory(undefined);
  };

  // Handle load more reviews
  const handleLoadMore = () => {
    setLoadingMore(true);

    // Simulate API request
    setTimeout(() => {
      setVisibleReviews(prev => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => selectedCourse === "all" || review.courseCode === selectedCourse)
    .sort((a, b) => {
      if (sortOption === "recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === "rating-high") {
        return b.ratings.overall - a.ratings.overall;
      } else if (sortOption === "rating-low") {
        return a.ratings.overall - b.ratings.overall;
      }
      return 0;
    });

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-6"
      >
        {/* Professor Info Sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-4">
              {professor.photoUrl && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={professor.photoUrl}
                    alt={professor.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <h1 className="text-2xl font-bold">{professor.name}</h1>
              <p className="text-muted-foreground mb-4">{professor.department}</p>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{professor.university}</p>
                  </div>
                </div>

                {professor.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <a
                        href={`mailto:${professor.email}`}
                        className="text-sm hover:underline text-primary"
                      >
                        {professor.email}
                      </a>
                    </div>
                  </div>
                )}

                {professor.website && (
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <a
                        href={professor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline text-primary"
                      >
                        Faculty Website
                      </a>
                    </div>
                  </div>
                )}

                {professor.officeHours && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Office Hours</p>
                      <p className="text-sm text-muted-foreground">{professor.officeHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Courses Taught</p>
                    <p className="text-sm text-muted-foreground">{professor.numCourses} courses</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ClipboardList className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Student Reviews</p>
                    <p className="text-sm text-muted-foreground">{professor.numReviews} reviews</p>
                  </div>
                </div>
              </div>

              {professor.bio && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{professor.bio}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3">
          {/* Rating Summary */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle>Professor Rating</CardTitle>
                <div className="flex items-center">
                  <Badge className="mr-2 text-lg px-3 py-1" variant={
                    professor.ratings.overall >= 4 ? "default" :
                    professor.ratings.overall <= 2 ? "destructive" :
                    "secondary"
                  }>
                    {professor.ratings.overall.toFixed(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {professor.numReviews} ratings
                  </p>
                </div>
              </div>
              <CardDescription>
                Based on student ratings and reviews
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Rating Metrics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Rating Breakdown</h3>

                  {Object.entries(professor.ratings).filter(([key]) => key !== "overall").map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <p className="text-sm capitalize w-28">{key}</p>
                      <Progress value={value * 20} className="h-2 flex-1" />
                      <p className="text-sm font-medium w-8 text-right">{value.toFixed(1)}</p>
                    </div>
                  ))}
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Statistics</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Would Take Again</p>
                      <Badge variant="outline" className="bg-chart-1/10">
                        {professor.statistics.wouldTakeAgain}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm">Difficulty Level</p>
                      <Badge variant="outline" className="bg-chart-2/10">
                        {professor.statistics.difficultyLevel.toFixed(1)}/5
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm">Attendance Mandatory</p>
                      <Badge variant="outline" className="bg-chart-3/10">
                        {professor.statistics.attendanceMandatory}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm">Textbook Required</p>
                      <Badge variant="outline" className="bg-chart-4/10">
                        {professor.statistics.textbookRequired}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium mb-2">Common Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {professor.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => setReviewFormOpen(true)}
                className="w-full"
              >
                Rate Professor {professor.name.split(' ')[1]}
              </Button>
            </CardFooter>
          </Card>

          {/* Courses Section */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Courses Taught</CardTitle>
              <CardDescription>
                Select a course to filter reviews
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCourse === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCourse("all")}
                >
                  All Courses
                </Badge>

                {professor.courses.map((course) => (
                  <Badge
                    key={course.code}
                    variant={selectedCourse === course.code ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCourse(course.code)}
                  >
                    {course.code} ({course.reviewCount})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Student Reviews</h2>

              <FilterDropdown
                sortOption={sortOption}
                onSortChange={setSortOption}
                variant="outline"
                showActiveFilters={false}
              />
            </div>

            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No reviews found for the selected filters.</p>
                  <Button onClick={() => setSelectedCourse("all")}>
                    View All Reviews
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                {filteredReviews.slice(0, visibleReviews).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}

                {visibleReviews < filteredReviews.length && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading..." : "Load More Reviews"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Review Form Dialog */}
      <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Rate Professor {professor.name}</DialogTitle>
            <DialogDescription>
              Share your experience with this professor to help other students.
              All reviews are moderated for appropriate content.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="course">Course Taken</Label>
                <Select
                  value={reviewCourse}
                  onValueChange={setReviewCourse}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {professor.courses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={reviewSemester}
                  onValueChange={setReviewSemester}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Fall 2023", "Summer 2023", "Spring 2023", "Fall 2022", "Summer 2022", "Spring 2022"].map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Ratings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(reviewRatings).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key} className="capitalize">{key}</Label>
                    <div id={key}>
                      <RatingStars
                        value={value}
                        interactive={true}
                        onChange={(newValue) => setReviewRatings({
                          ...reviewRatings,
                          [key]: newValue,
                        })}
                        showValue={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                id="review"
                rows={5}
                placeholder="Share your experience with this professor..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Would Take Again?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={wouldTakeAgain === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldTakeAgain(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={wouldTakeAgain === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldTakeAgain(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Textbook Required?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={textbookRequired === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextbookRequired(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={textbookRequired === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextbookRequired(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Attendance</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={attendanceMandatory === "mandatory" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAttendanceMandatory("mandatory")}
                  >
                    Mandatory
                  </Button>
                  <Button
                    type="button"
                    variant={attendanceMandatory === "optional" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAttendanceMandatory("optional")}
                  >
                    Optional
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="grade">Your Grade (Optional)</Label>
              <Select
                value={reviewGrade}
                onValueChange={setReviewGrade}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Audit", "Withdraw", "Incomplete"].map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous">Submit review anonymously</Label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setReviewFormOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitReview}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}