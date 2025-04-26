"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showBoundaryButtons?: boolean;
  maxButtons?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showBoundaryButtons = true,
  maxButtons = 5,
}: PaginationProps) {
  // If only a single page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  const renderPageButton = (pageNumber: number) => {
    return (
      <Button
        key={pageNumber}
        variant={currentPage === pageNumber ? "default" : "outline"}
        size="icon"
        className={cn(
          "w-9 h-9",
          currentPage === pageNumber && "pointer-events-none"
        )}
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    );
  };

  const renderEllipsis = (key: string) => {
    return (
      <Button
        key={key}
        variant="outline"
        disabled
        size="icon"
        className="w-9 h-9 pointer-events-none"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  };

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const halfMaxButtons = Math.floor(maxButtons / 2);

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add initial ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ending ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1">
      {showBoundaryButtons && (
        <Button
          variant="outline"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-3" />
          <span className="sr-only">First page</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageNumbers.map((page) =>
        typeof page === "number"
          ? renderPageButton(page)
          : renderEllipsis(page as string)
      )}

      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>

      {showBoundaryButtons && (
        <Button
          variant="outline"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-3" />
          <span className="sr-only">Last page</span>
        </Button>
      )}
    </div>
  );
}