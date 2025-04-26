"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RatingStars from "@/components/ui/rating-stars";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/dialogs/report-dialog";

export interface Review {
  id: string;
  userId: string;
  professorId: string;
  courseCode?: string;
  courseTitle?: string;
  semester?: string;
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
  wouldTakeAgain?: boolean;
  textbookRequired?: boolean;
  attendance?: "mandatory" | "optional" | "unknown";
  grade?: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
}

interface ReviewCardProps {
  review: Review;
  isLoading?: boolean;
}

export default function ReviewCard({ review, isLoading = false }: ReviewCardProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(review.userVote || null);
  const [upvoteCount, setUpvoteCount] = useState(review.upvotes);
  const [downvoteCount, setDownvoteCount] = useState(review.downvotes);

  if (isLoading) {
    return <ReviewCardSkeleton />;
  }

  const handleVote = (vote: "up" | "down") => {
    // Toggle the vote if already selected
    if (userVote === vote) {
      setUserVote(null);
      if (vote === "up") {
        setUpvoteCount(prevCount => prevCount - 1);
      } else {
        setDownvoteCount(prevCount => prevCount - 1);
      }
    } else {
      // If changing vote, update both counts
      if (userVote === "up" && vote === "down") {
        setUpvoteCount(prevCount => prevCount - 1);
        setDownvoteCount(prevCount => prevCount + 1);
      } else if (userVote === "down" && vote === "up") {
        setDownvoteCount(prevCount => prevCount - 1);
        setUpvoteCount(prevCount => prevCount + 1);
      } else {
        // New vote
        if (vote === "up") {
          setUpvoteCount(prevCount => prevCount + 1);
        } else {
          setDownvoteCount(prevCount => prevCount + 1);
        }
      }
      setUserVote(vote);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {review.anonymous ? (
              <Avatar>
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  A
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {review.userName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            )}

            <div>
              <p className="font-medium">
                {review.anonymous ? "Anonymous Student" : review.userName}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  {formatDistanceToNow(review.date, { addSuffix: true })}
                </span>
                {review.courseCode && (
                  <>
                    <span className="mx-1.5">•</span>
                    <span>
                      {review.courseCode}
                    </span>
                  </>
                )}
                {review.semester && (
                  <>
                    <span className="mx-1.5">•</span>
                    <span>
                      {review.semester}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Badge className="mr-2" variant={
              review.ratings.overall >= 4 ? "default" :
              review.ratings.overall <= 2 ? "destructive" :
              "secondary"
            }>
              {review.ratings.overall.toFixed(1)}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Teaching</p>
            <RatingStars value={review.ratings.teaching} size="sm" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Helpfulness</p>
            <RatingStars value={review.ratings.helpfulness} size="sm" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fairness</p>
            <RatingStars value={review.ratings.fairness} size="sm" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Clarity</p>
            <RatingStars value={review.ratings.clarity} size="sm" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Communication</p>
            <RatingStars value={review.ratings.communication} size="sm" />
          </div>
          {review.grade && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Final Grade</p>
              <p className="text-sm font-medium">{review.grade}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm whitespace-pre-line">{review.comment}</p>
        </div>

        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {review.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          {review.wouldTakeAgain !== undefined && (
            <Badge variant={review.wouldTakeAgain ? "default" : "destructive"} className="text-xs">
              {review.wouldTakeAgain ? "Would take again" : "Would not take again"}
            </Badge>
          )}
          {review.textbookRequired !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Textbook {review.textbookRequired ? "required" : "not required"}
            </Badge>
          )}
          {review.attendance && (
            <Badge variant="secondary" className="text-xs">
              Attendance {review.attendance}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-3 pt-0 flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={userVote === "up" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => handleVote("up")}
          >
            <ThumbsUp className={cn(
              "h-4 w-4 mr-1.5",
              userVote === "up" && "fill-current"
            )} />
            Helpful
            {upvoteCount > 0 && <span className="ml-1.5 text-xs">({upvoteCount})</span>}
          </Button>

          <Button
            variant={userVote === "down" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => handleVote("down")}
          >
            <ThumbsDown className={cn(
              "h-4 w-4 mr-1.5",
              userVote === "down" && "fill-current"
            )} />
            Unhelpful
            {downvoteCount > 0 && <span className="ml-1.5 text-xs">({downvoteCount})</span>}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => setReportDialogOpen(true)}
        >
          <Flag className="h-4 w-4 mr-1.5" />
          Report
        </Button>
      </CardFooter>

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reviewId={review.id}
      />
    </Card>
  );
}

function ReviewCardSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div>
              <div className="h-5 bg-muted rounded w-32 mb-2" />
              <div className="h-4 bg-muted rounded w-40" />
            </div>
          </div>
          <div className="h-6 w-12 bg-muted rounded" />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-muted rounded w-16 mb-1.5" />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-3 h-3 rounded-full bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>

        <div className="flex gap-2 mt-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-5 w-24 bg-muted rounded" />
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-3 pt-0 flex justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
        <div className="h-8 w-16 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}