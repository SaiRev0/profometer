"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Bookmark,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  User
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RatingStars from "@/components/ui/rating-stars";
import { cn } from "@/lib/utils";

export interface Professor {
  id: string;
  name: string;
  department: string;
  branch: string;
  rating: number;
  numReviews: number;
  imageUrl?: string;
  difficultyLevel?: number;
  topReview?: {
    rating: number;
    comment: string;
  };
}

interface ProfessorCardProps {
  professor: Professor;
  variant?: "compact" | "detailed";
  isLoading?: boolean;
}

export default function ProfessorCard({
  professor,
  variant = "detailed",
  isLoading = false,
}: ProfessorCardProps) {
  if (isLoading) {
    return <ProfessorCardSkeleton variant={variant} />;
  }

  const isCompact = variant === "compact";
  const initials = professor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const cardContent = (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md border-border/70",
      isCompact ? "h-40" : "h-full"
    )}>
      <CardContent className={cn(
        "p-4",
        isCompact ? "pb-2" : "pb-3"
      )}>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            {professor.imageUrl ? (
              <AvatarImage src={professor.imageUrl} alt={professor.name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "font-bold line-clamp-1",
                  isCompact ? "text-base" : "text-lg"
                )}>
                  {professor.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-1 mb-1">
                  {professor.department}
                </p>
              </div>

              <Badge variant={professor.rating >= 4 ? "default" : professor.rating <= 2 ? "destructive" : "secondary"}>
                {professor.rating.toFixed(1)}
              </Badge>
            </div>

            <div className="flex items-center mt-1 mb-2">
              <RatingStars
                value={professor.rating}
                size={isCompact ? "sm" : "md"}
              />
              <span className="text-xs text-muted-foreground ml-2">
                ({professor.numReviews})
              </span>
            </div>

            {!isCompact && professor.topReview && (
              <blockquote className="mt-2 text-sm text-muted-foreground border-l-2 pl-2 border-primary/30 line-clamp-2">
                "{professor.topReview.comment}"
              </blockquote>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn(
        "px-4 pb-4 pt-0 flex justify-between items-center",
        isCompact && "pt-0"
      )}>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Helpful
          </Button>
          {!isCompact && (
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
              <Bookmark className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          asChild
        >
          <div>
            View
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/professor/${professor.id}`}>
        {cardContent}
      </Link>
    </motion.div>
  );
}

function ProfessorCardSkeleton({ variant = "detailed" }: { variant?: "compact" | "detailed" }) {
  const isCompact = variant === "compact";

  return (
    <Card className={cn(
      "overflow-hidden",
      isCompact ? "h-40" : "h-full"
    )}>
      <CardContent className={cn(
        "p-4",
        isCompact ? "pb-2" : "pb-3"
      )}>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-5 bg-muted rounded w-32 mb-2" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
              <div className="h-6 w-10 bg-muted rounded" />
            </div>

            <div className="flex items-center gap-1 mb-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn(
                  "rounded-full bg-muted",
                  isCompact ? "w-3 h-3" : "w-4 h-4"
                )} />
              ))}
              <div className="w-8 h-3 bg-muted rounded ml-2" />
            </div>

            {!isCompact && (
              <>
                <div className="flex gap-1 my-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-5 w-16 bg-muted rounded" />
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}