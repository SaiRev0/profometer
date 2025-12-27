/**
 * Breakdown of report reasons with counts
 */
export interface ReportReasonBreakdown {
  inappropriate?: number;
  spam?: number;
  notRelevant?: number;
  fake?: number;
  other?: number;
  [key: string]: number | undefined; // Allow dynamic reasons
}

/**
 * Individual reporter information
 */
export interface ReporterInfo {
  reportId: string;
  username: string;
  userId: string;
  reason: string;
  details: string | null;
  createdAt: string;
}

/**
 * Grouped review report
 */
export interface GroupedReviewReport {
  contentId: string;
  reportCount: number;
  reasonBreakdown: ReportReasonBreakdown;
  reporters: ReporterInfo[];
  content: {
    id: string;
    comment: string;
    fullComment: string;
    type: 'professor' | 'course';
    upvotes: number;
    downvotes: number;
    createdAt: string;
    author: {
      id: string;
      username: string;
    };
    professor: {
      id: string;
      name: string;
    } | null;
    course: {
      code: string;
      name: string;
    } | null;
  };
  firstReportedAt: string;
  lastReportedAt: string;
}

/**
 * Grouped comment report
 */
export interface GroupedCommentReport {
  contentId: string;
  reportCount: number;
  reasonBreakdown: ReportReasonBreakdown;
  reporters: ReporterInfo[];
  content: {
    id: string;
    content: string;
    fullContent: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    author: {
      id: string;
      username: string;
    };
    review: {
      id: string;
      type: 'professor' | 'course';
      professor: {
        id: string;
        name: string;
      } | null;
      course: {
        code: string;
        name: string;
      } | null;
    };
  };
  firstReportedAt: string;
  lastReportedAt: string;
}

/**
 * API Response for grouped reports
 */
export interface GroupedReportsResponse {
  groupedReports: GroupedReviewReport[] | GroupedCommentReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    totalReports: number;
    totalGroups: number;
  };
}

/**
 * Sort options
 */
export type ReportSortBy = 'reportCount' | 'firstReported' | 'lastReported';
export type SortOrder = 'asc' | 'desc';
