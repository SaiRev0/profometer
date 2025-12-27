# Security & Performance Issues - Profometer

**Generated:** December 26, 2024  
**Status:** Verified against codebase

This document outlines security vulnerabilities, performance issues, and missing features discovered in the Profometer application. Each issue has been verified against the actual codebase with specific file references and recommended solutions.

---

## 🔴 Critical Security Issues

### 1. NO API RATE LIMITING

**Severity:** Critical  
**Status:** ✅ Verified  
**Locations:** All API routes (`/src/app/api/*`)

#### Issue

No rate limiting exists on ANY API endpoint in the application. This leaves the application vulnerable to:

- **DDoS attacks** - Attackers can overwhelm the server with requests
- **Spam submissions** - Unlimited review and comment spam
- **Database exhaustion** - Resource exhaustion through excessive queries
- **Credential stuffing** - Brute force attacks on authentication endpoints

#### Evidence

Search for rate limiting middleware returned 0 results. No middleware protection exists on any of the 30+ API routes.

#### Solution

**Option 1: Use Vercel's Rate Limiting (Recommended for Vercel deployments)**

```bash
npm install @vercel/edge-rate-limit
```

Create a rate limit utility:

```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';

import { RateLimiter } from '@vercel/edge-rate-limit';

const rateLimiter = new RateLimiter({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500
});

export async function rateLimit(request: NextRequest, limit: number = 10) {
  const ip = request.ip ?? '127.0.0.1';
  try {
    await rateLimiter.check(limit, ip);
  } catch {
    throw new Error('Rate limit exceeded');
  }
}
```

**Implementation in API routes:**

```typescript
// Example: src/app/api/comment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { apiRateLimiter } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting check
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await submissionRateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  // Rest of your logic...
}
```

**Priority Endpoints to Protect:**

- `/api/review/create` - Prevent spam reviews
- `/api/comment/create` - Prevent spam comments
- `/api/auth/*` - Prevent brute force attacks
- `/api/search` - Prevent search abuse
- `/api/comment/report` and `/api/review/report` - Prevent report spam

---

### 2. WEAK INPUT VALIDATION

**Severity:** High  
**Status:** ✅ Verified  
**Locations:**

- [`/src/app/api/comment/create/route.ts`](src/app/api/comment/create/route.ts:16-26)
- [`/src/app/api/review/create/route.ts`](src/app/api/review/create/route.ts:18-24)

#### Issue

API routes only perform basic string checks with no schema validation:

- **SQL injection risk** through Prisma (low but possible with raw queries)
- **XSS vulnerabilities** if content isn't properly sanitized before rendering
- **Data integrity issues** from malformed inputs
- **No type safety** at runtime despite TypeScript types

#### Evidence

```typescript
// Current validation in comment/create/route.ts
if (!reviewId || !content?.trim()) {
  return NextResponse.json({ error: 'Review ID and content are required' }, { status: 400 });
}

if (content.trim().length > 2000) {
  return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 });
}
```

Zod is already installed in `package.json` but not being used for validation.

#### Solution

**Create Zod validation schemas:**

```typescript
// src/lib/validations/comment.ts
import { z } from 'zod';

export const createCommentSchema = z.object({
  reviewId: z.string().cuid('Invalid review ID'),
  parentId: z.string().cuid('Invalid parent comment ID').optional().nullable(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment too long (max 2000 characters)')
    .trim()
    .refine((val) => val.length > 0, 'Comment cannot be empty after trimming')
});

export const editCommentSchema = z.object({
  commentId: z.string().cuid('Invalid comment ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long (max 2000 characters)').trim()
});

export const reportCommentSchema = z.object({
  commentId: z.string().cuid('Invalid comment ID'),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other'], {
    errorMap: () => ({ message: 'Invalid report reason' })
  }),
  details: z.string().max(500, 'Details too long (max 500 characters)').optional()
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type ReportCommentInput = z.infer<typeof reportCommentSchema>;
```

```typescript
// src/lib/validations/review.ts
import { z } from 'zod';

const professorRatingSchema = z.object({
  overall: z.number().min(0).max(5),
  teaching: z.number().min(0).max(5),
  helpfulness: z.number().min(0).max(5),
  fairness: z.number().min(0).max(5),
  clarity: z.number().min(0).max(5),
  communication: z.number().min(0).max(5)
});

const courseRatingSchema = z.object({
  overall: z.number().min(0).max(5),
  scoring: z.number().min(0).max(5),
  engaging: z.number().min(0).max(5),
  conceptual: z.number().min(0).max(5),
  easyToLearn: z.number().min(0).max(5)
});

const percentageSchema = z.object({
  wouldRecommend: z.boolean(),
  attendanceRating: z.number().min(0).max(100),
  quizes: z.boolean(),
  assignments: z.boolean()
});

export const createReviewSchema = z.object({
  professorId: z.string().cuid('Invalid professor ID'),
  courseCode: z.string().regex(/^[A-Z]{2,5}\d{3,4}$/, 'Invalid course code format'),
  semester: z.string().regex(/^(Spring|Fall|Summer|Winter)\s\d{4}$/, 'Invalid semester format'),
  ratings: z.union([professorRatingSchema, courseRatingSchema]),
  comment: z
    .string()
    .min(50, 'Review must be at least 50 characters')
    .max(5000, 'Review too long (max 5000 characters)')
    .trim(),
  statistics: percentageSchema,
  grade: z
    .string()
    .regex(/^[A-F][+-]?$/)
    .optional()
    .nullable(),
  type: z.enum(['professor', 'course'])
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
```

**Update API routes to use validation:**

```typescript
// src/app/api/comment/create/route.ts
import { NextResponse } from 'next/server';

import { createCommentSchema } from '@/lib/validations/comment';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input with Zod
    const validationResult = createCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { reviewId, parentId, content } = validationResult.data;

    // Rest of your logic with validated data...
  } catch (error) {
    // Error handling...
  }
}
```

**Additional: Sanitize HTML content before rendering**

```bash
npm install dompurify isomorphic-dompurify
npm install -D @types/dompurify
```

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  });
}
```

---

### 3. MISSING CSRF PROTECTION

**Severity:** High  
**Status:** ✅ Verified  
**Locations:** All mutation API routes

#### Issue

No CSRF tokens on forms or API mutation endpoints. While NextAuth provides some protection for authentication routes, custom API routes (create review, create comment, delete, edit, vote, report) are vulnerable to Cross-Site Request Forgery attacks.

#### Evidence

No CSRF middleware found in the codebase. Routes like `/api/review/create`, `/api/comment/create`, `/api/comment/delete/[id]`, etc., lack CSRF protection.

#### Solution

**Option 1: Use next-csrf package**

```bash
npm install next-csrf
```

```typescript
// src/middleware.ts
import { createMiddleware } from 'next-csrf';

const csrfMiddleware = createMiddleware({
  secret: process.env.CSRF_SECRET!
});

export async function middleware(request: NextRequest) {
  // Apply CSRF protection to mutation endpoints
  if (
    request.method !== 'GET' &&
    request.nextUrl.pathname.startsWith('/api/') &&
    !request.nextUrl.pathname.startsWith('/api/auth/')
  ) {
    const response = await csrfMiddleware(request);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};
```

---

### 4. NO CONTENT SECURITY POLICY (CSP)

**Severity:** Medium  
**Status:** ✅ Verified  
**Locations:** [`next.config.ts`](next.config.ts)

#### Issue

Missing security headers including Content Security Policy. This increases XSS vulnerability surface area and allows potentially malicious content to be loaded.

#### Evidence

The `next.config.ts` file has no security headers configured.

#### Solution

Update `next.config.ts` with comprehensive security headers:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://avatars.githubusercontent.com https://images.unsplash.com https://images.pexels.com https://iitbhu.ac.in https://lh3.googleusercontent.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://accounts.google.com",
              "frame-src 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests'
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
```

**Note:** Adjust CSP directives based on your actual requirements. The above is a starting point.

---

## 🟡 High Priority Issues

### 5. MISSING ERROR MONITORING

**Severity:** High  
**Status:** ✅ Verified  
**Locations:** All error handling throughout the application

#### Issue

No error tracking or monitoring infrastructure. Issues in production:

- You won't know when production breaks
- No way to debug user-reported issues
- No visibility into error patterns
- Lost revenue opportunities from undetected bugs

#### Evidence

All error handling uses `console.error()` with no external monitoring service integration.

#### Solution

**Option 1: Sentry (Recommended)**

```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard@latest -i nextjs
```

This will create:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

Configure Sentry:

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Adjust sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture errors
  beforeSend(event, hint) {
    // Filter out known issues or add custom context
    return event;
  },

  // Configure integrations
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })]
});
```

Update API routes to use Sentry:

```typescript
// src/app/api/review/create/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
  try {
    // Your logic...
  } catch (error) {
    // Log to Sentry with context
    Sentry.captureException(error, {
      tags: {
        route: 'review/create',
        type: 'review_creation_error'
      },
      extra: {
        userId: session?.user?.id,
        reviewData: sanitizedData // Don't log sensitive info
      }
    });

    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Option 2: LogRocket**

```bash
npm install logrocket
```

```typescript
// src/lib/logger.ts
import LogRocket from 'logrocket';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);
}

export { LogRocket };
```

**Option 3: Vercel's Built-in Monitoring**

If deployed on Vercel, enable Runtime Logs and Speed Insights in your project settings. No code changes required.

---

### 6. NO LOGGING INFRASTRUCTURE

**Severity:** Medium  
**Status:** ✅ Verified  
**Locations:** Throughout application (e.g., [`/src/app/api/professors/route.ts:97`](src/app/api/professors/route.ts:97))

#### Issue

Only `console.error()` scattered throughout the codebase:

- No structured logging
- No log aggregation
- Difficult to debug production issues
- No log levels (info, warn, error, debug)

#### Evidence

```typescript
// Current logging in professors/route.ts
console.error('Error fetching professors:', error);
```

#### Solution

**Option 1: Pino (High Performance)**

```bash
npm install pino pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  }),
  ...(process.env.NODE_ENV === 'production' && {
    formatters: {
      level: (label) => {
        return { level: label };
      }
    }
  })
});

// Helper to create child logger with context
export function createLogger(context: string) {
  return logger.child({ context });
}
```

**Option 2: Winston**

```bash
npm install winston
```

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'profometer' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  );
}

export { logger };
```

**Usage in API routes:**

```typescript
// src/app/api/review/create/route.ts
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    logger.info('Creating review', { userId: session.user.id });

    // Your logic...

    logger.info('Review created successfully', { reviewId: result.id });
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error creating review', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 7. COMPLEX TRANSACTION LOGIC WITHOUT SAFEGUARDS

**Severity:** Medium  
**Status:** ✅ Verified  
**Locations:** [`/src/app/api/review/create/route.ts`](src/app/api/review/create/route.ts:27-368)

#### Issue

The review creation endpoint has:

- 382 lines of complex transaction code
- No timeout configured
- No retry logic
- Can deadlock under high load
- Multiple sequential database queries within transaction

#### Evidence

```typescript
// Current implementation
const result = await db.$transaction(async (tx) => {
  // 340+ lines of complex operations
  // Multiple queries, calculations, updates
  // No timeout specified
});
```

#### Solution

**1. Add transaction timeout:**

```typescript
// src/app/api/review/create/route.ts
const result = await db.$transaction(
  async (tx) => {
    // Your transaction logic...
  },
  {
    maxWait: 5000, // Wait max 5 seconds for transaction to start
    timeout: 10000, // Transaction must complete within 10 seconds
    isolationLevel: 'ReadCommitted' // Prevent dirty reads
  }
);
```

**2. Break into smaller operations:**

```typescript
// src/lib/services/review.service.ts
export class ReviewService {
  async createReview(data: CreateReviewInput, userId: string) {
    // Step 1: Validation (no transaction)
    await this.validateReview(data);

    // Step 2: Create review with minimal transaction
    const review = await this.createReviewRecord(data, userId);

    // Step 3: Update statistics (separate transaction)
    await this.updateStatistics(review);

    // Step 4: Update aggregates (can be async/queued)
    await this.updateAggregates(review);

    return review;
  }

  private async createReviewRecord(data: CreateReviewInput, userId: string) {
    return db.$transaction(
      async (tx) => {
        // Check for duplicate
        const existing = await tx.review.findFirst({
          where: { userId, type: data.type, professorId: data.professorId }
        });

        if (existing) throw new Error('Duplicate review');

        // Create review
        return tx.review.create({ data: { ...data, userId } });
      },
      { timeout: 5000 }
    );
  }

  private async updateStatistics(review: Review) {
    // Separate transaction for statistics
    return db.$transaction(
      async (tx) => {
        // Update professor stats
        await this.updateProfessorStats(tx, review);
        // Update course stats
        await this.updateCourseStats(tx, review);
      },
      { timeout: 5000 }
    );
  }
}
```

**3. Add retry logic for transient failures:**

```typescript
// src/lib/retry.ts
export async function retryTransaction<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Only retry on specific errors (deadlocks, timeouts)
      if (!error.message.includes('deadlock') && !error.message.includes('timeout')) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Usage
const result = await retryTransaction(() =>
  db.$transaction(async (tx) => {
    // Your transaction
  })
);
```

**4. Consider using a job queue for heavy operations:**

```bash
npm install bullmq ioredis
```

```typescript
// src/lib/queues/review-stats.queue.ts
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

export const reviewStatsQueue = new Queue('review-stats', { connection });

// Worker to process stats updates
new Worker(
  'review-stats',
  async (job) => {
    const { reviewId } = job.data;
    await updateReviewStatistics(reviewId);
  },
  { connection }
);

// Usage in API route
await reviewStatsQueue.add('update-stats', { reviewId: review.id });
```

---

## 🟡 Medium Priority Issues

### 8. MISSING REPORT MODERATION SYSTEM

**Severity:** Medium  
**Status:** ✅ Verified  
**Locations:**

- [`/src/app/api/comment/report/route.ts`](src/app/api/comment/report/route.ts)
- Schema: [`/prisma/schema.prisma`](prisma/schema.prisma:216-229) (CommentReport), [`/prisma/schema.prisma`](prisma/schema.prisma:245-259) (ReviewReport)

#### Issue

Reports go to the database but:

- No admin panel to review reports
- No automated flagging system
- No notification system for moderators
- Reported content remains visible

#### Evidence

```typescript
// comment/report/route.ts just creates a report
await db.commentReport.create({
  data: { commentId, reason, details, reportedBy: session.user.id }
});
// No further action taken
```

Schema has `CommentReport` and `ReviewReport` models but no moderation interface.

#### Solution

**1. Create an admin dashboard:**

```typescript
// src/app/admin/reports/page.tsx
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await getServerSession();

  // Check if user is admin
  if (!session?.user?.email?.endsWith('@admin.itbhu.ac.in')) {
    redirect('/');
  }

  const [reviewReports, commentReports] = await Promise.all([
    db.reviewReport.findMany({
      include: {
        review: { include: { user: true, professor: true, course: true } },
        reporter: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.commentReport.findMany({
      include: {
        comment: { include: { user: true, review: true } },
        reporter: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Moderation Dashboard</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Review Reports</h2>
          <ReportsList reports={reviewReports} type="review" />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Comment Reports</h2>
          <ReportsList reports={commentReports} type="comment" />
        </section>
      </div>
    </div>
  );
}
```

**2. Create moderation actions API:**

```typescript
// src/app/api/admin/moderate/route.ts
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();

  // Verify admin
  if (!session?.user?.email?.endsWith('@admin.itbhu.ac.in')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { action, type, id, reportId } = await req.json();

  try {
    switch (action) {
      case 'delete':
        if (type === 'review') {
          await db.review.delete({ where: { id } });
        } else {
          await db.reviewComment.delete({ where: { id } });
        }
        break;

      case 'dismiss':
        if (type === 'review') {
          await db.reviewReport.delete({ where: { id: reportId } });
        } else {
          await db.commentReport.delete({ where: { id: reportId } });
        }
        break;

      case 'ban-user':
        // Implement user ban logic
        await db.user.update({
          where: { id },
          data: { banned: true } // Add 'banned' field to schema
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}
```

**3. Add automated flagging:**

```typescript
// src/lib/moderation.ts
import Filter from 'bad-words';

const filter = new Filter();

export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

export function autoFlagContent(content: string): {
  shouldFlag: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check profanity
  if (containsProfanity(content)) {
    reasons.push('Contains inappropriate language');
  }

  // Check for spam patterns
  if (content.match(/https?:\/\//gi)?.length > 3) {
    reasons.push('Contains multiple URLs (spam)');
  }

  // Check for repeated characters
  if (/(.)\1{10,}/.test(content)) {
    reasons.push('Contains spam patterns');
  }

  // Check content length (suspiciously short or copy-paste)
  if (content.length < 20) {
    reasons.push('Content too short');
  }

  return {
    shouldFlag: reasons.length > 0,
    reasons
  };
}

// Use in review/comment creation
const { shouldFlag, reasons } = autoFlagContent(content);
if (shouldFlag) {
  // Auto-create report or mark for review
  await db.reviewReport.create({
    data: {
      reviewId: review.id,
      reason: 'automatic',
      details: `Auto-flagged: ${reasons.join(', ')}`,
      reportedBy: 'system'
    }
  });
}
```

**4. Email notifications for moderators:**

```bash
npm install nodemailer
```

```typescript
// src/lib/notifications.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function notifyModerators(report: { type: 'review' | 'comment'; reason: string; contentId: string }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.MODERATOR_EMAIL,
    subject: `New ${report.type} report: ${report.reason}`,
    html: `
      <h2>New Content Report</h2>
      <p><strong>Type:</strong> ${report.type}</p>
      <p><strong>Reason:</strong> ${report.reason}</p>
      <p><strong>Content ID:</strong> ${report.contentId}</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/admin/reports">Review in dashboard</a></p>
    `
  });
}
```

---

### 9. SEARCH NOT OPTIMIZED

**Severity:** Medium  
**Status:** ✅ Verified  
**Locations:** [`/src/app/api/search/route.ts`](src/app/api/search/route.ts:15-62)

#### Issue

Using Prisma's `contains` for search:

- Slow on large datasets (requires full table scans)
- No full-text search capabilities
- No relevance ranking
- Poor user experience as data grows

#### Evidence

```typescript
// Current implementation
const professors = await db.professor.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { departmentCode: { contains: query.toUpperCase(), mode: 'insensitive' } }
    ]
  }
});
```

#### Solution

**Option 1: PostgreSQL Full-Text Search (Recommended)**

```sql
-- Add to migration file
-- Create text search columns and indexes
ALTER TABLE "Professor" ADD COLUMN "search_vector" tsvector;
ALTER TABLE "Course" ADD COLUMN "search_vector" tsvector;
ALTER TABLE "Department" ADD COLUMN "search_vector" tsvector;

-- Create indexes for fast full-text search
CREATE INDEX "Professor_search_vector_idx" ON "Professor" USING GIN ("search_vector");
CREATE INDEX "Course_search_vector_idx" ON "Course" USING GIN ("search_vector");
CREATE INDEX "Department_search_vector_idx" ON "Department" USING GIN ("search_vector");

-- Create triggers to auto-update search vectors
CREATE FUNCTION professor_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."departmentCode", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professor_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Professor"
FOR EACH ROW EXECUTE FUNCTION professor_search_vector_update();

-- Similar for Course and Department tables
```

```typescript
// src/app/api/search/route.ts (updated)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  // Use PostgreSQL full-text search
  const [professors, courses, departments] = await Promise.all([
    db.$queryRaw`
      SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${query})) as rank
      FROM "Professor"
      WHERE search_vector @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 3
    `,
    db.$queryRaw`
      SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${query})) as rank
      FROM "Course"
      WHERE search_vector @@ plainto_tsquery('english', ${query})
        AND verified = true
      ORDER BY rank DESC
      LIMIT 3
    `,
    db.$queryRaw`
      SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${query})) as rank
      FROM "Department"
      WHERE search_vector @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 3
    `
  ]);

  return NextResponse.json({ professors, courses, departments });
}
```

**Option 2: Algolia (Best for complex search)**

```bash
npm install algoliasearch
```

```typescript
// src/lib/algolia.ts
import algoliasearch from 'algoliasearch';

export const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);

export const professorsIndex = searchClient.initIndex('professors');
export const coursesIndex = searchClient.initIndex('courses');
export const departmentsIndex = searchClient.initIndex('departments');

// Sync data to Algolia (run periodically or on updates)
export async function syncProfessorsToAlgolia() {
  const professors = await db.professor.findMany({
    include: { department: true }
  });

  const records = professors.map((prof) => ({
    objectID: prof.id,
    name: prof.name,
    department: prof.department.name,
    departmentCode: prof.departmentCode,
    statistics: prof.statistics
  }));

  await professorsIndex.saveObjects(records);
}
```

```typescript
// src/app/api/search/route.ts (Algolia version)
import { searchClient } from '@/lib/algolia';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  const [professorsResults, coursesResults, departmentsResults] = await Promise.all([
    searchClient.initIndex('professors').search(query, { hitsPerPage: 3 }),
    searchClient.initIndex('courses').search(query, { hitsPerPage: 3 }),
    searchClient.initIndex('departments').search(query, { hitsPerPage: 3 })
  ]);

  return NextResponse.json({
    professors: professorsResults.hits,
    courses: coursesResults.hits,
    departments: departmentsResults.hits
  });
}
```

**Option 3: Add database indexes (Quick improvement)**

```sql
-- Add indexes to speed up LIKE queries
CREATE INDEX "Professor_name_gin_idx" ON "Professor" USING gin (name gin_trgm_ops);
CREATE INDEX "Course_name_gin_idx" ON "Course" USING gin (name gin_trgm_ops);
CREATE INDEX "Department_name_gin_idx" ON "Department" USING gin (name gin_trgm_ops);

-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 🟢 Low Priority Issues

### 10. NO DATABASE BACKUP STRATEGY

**Severity:** Low (Infrastructure)  
**Status:** ⚠️ Partially Verified  
**Locations:** Infrastructure/Deployment (not code)

#### Issue

Using Supabase (good!) but:

- No backup verification process documented
- No migration rollback strategy documented
- No disaster recovery plan

#### Solution

**1. Document backup procedures:**

Create `BACKUP_STRATEGY.md`:

```markdown
# Database Backup Strategy

## Automatic Backups (Supabase)

- Supabase provides automatic daily backups (retained for 7 days on free tier)
- Upgrade to Pro plan for 30-day retention
- Access backups: Supabase Dashboard > Database > Backups

## Manual Backups

Run before major migrations:
\`\`\`bash

# Export database

pg_dump -h <supabase-host> -U postgres -d postgres > backup-$(date +%Y%m%d).sql

# Verify backup

pg_restore --list backup-$(date +%Y%m%d).sql
\`\`\`

## Migration Rollback

\`\`\`bash

# Revert last migration

npx prisma migrate rollback

# Restore from backup if needed

psql -h <supabase-host> -U postgres -d postgres < backup-20240101.sql
\`\`\`

## Testing Restores

- Test restore process monthly
- Restore to staging environment
- Verify data integrity
  \`\`\`
```

**2. Add backup verification script:**

```typescript
// scripts/verify-backup.ts
import { db } from '../src/lib/db';

async function verifyBackup() {
  try {
    // Test database connection
    await db.$connect();

    // Verify critical tables
    const [professors, courses, reviews, users] = await Promise.all([
      db.professor.count(),
      db.course.count(),
      db.review.count(),
      db.user.count()
    ]);

    console.log('✅ Backup verification successful');
    console.log(`Professors: ${professors}`);
    console.log(`Courses: ${courses}`);
    console.log(`Reviews: ${reviews}`);
    console.log(`Users: ${users}`);

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    process.exit(1);
  }
}

verifyBackup();
```

**3. Set up Point-in-Time Recovery (Supabase Pro):**

- Enable PITR in Supabase dashboard
- Allows recovery to any point within retention window
- Essential for production environments

---

### 11. ~~NO USERNAME GENERATION COLLISION HANDLING~~

**Severity:** None  
**Status:** ❌ **NOT AN ISSUE** - Already implemented correctly  
**Locations:** [`/src/lib/username-generator.ts`](src/lib/username-generator.ts:14-46)

#### Verification

The code ALREADY handles username collisions properly:

```typescript
export async function generateUsername(options: UsernameOptions = {}): Promise<string> {
  let username: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    username = generateUniqueUsername(separator, digitCount);

    // Check if username exists in database
    const existingUser = await db.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    username = `${generateUniqueUsername(separator, digitCount)}${separator || '_'}${Date.now()}`;
  }

  return username!;
}
```

**Features already implemented:**

- ✅ Checks database for collisions
- ✅ Retries up to 10 times
- ✅ Timestamp fallback ensures uniqueness
- ✅ Called safely in auth.ts during user creation

**No action needed for this item.**

---

## 📊 Summary & Priority

### Immediate Action Required (Week 1)

1. ✅ **API Rate Limiting** - Critical security issue
2. ✅ **Input Validation with Zod** - Prevents multiple vulnerabilities
3. ✅ **Error Monitoring** - Essential for production visibility

### Short Term (Week 2-3)

4. ✅ **CSRF Protection** - Important security measure
5. ✅ **Content Security Policy** - Reduces XSS risks
6. ✅ **Structured Logging** - Improves debugging

### Medium Term (Month 1)

7. ✅ **Report Moderation System** - User safety and content quality
8. ✅ **Transaction Optimization** - Performance and reliability
9. ✅ **Search Optimization** - User experience improvement

### Long Term (As Needed)

10. ✅ **Database Backup Documentation** - Disaster recovery
11. ❌ **Username Collision Handling** - Already implemented correctly

---

## 📝 Implementation Checklist

```markdown
### Security

- [ ] Implement API rate limiting on all endpoints
- [ ] Add Zod validation schemas for all API inputs
- [ ] Configure CSRF protection
- [ ] Add security headers (CSP, HSTS, etc.)
- [ ] Set up error monitoring (Sentry/LogRocket)

### Performance

- [ ] Add transaction timeouts and retry logic
- [ ] Optimize search with PostgreSQL full-text search or Algolia
- [ ] Implement database query indexes

### Operations

- [ ] Set up structured logging (Pino/Winston)
- [ ] Create moderation dashboard for reports
- [ ] Document backup and recovery procedures
- [ ] Test disaster recovery plan

### Monitoring

- [ ] Configure Sentry for error tracking
- [ ] Set up alerts for critical errors
- [ ] Monitor API response times
- [ ] Track user-facing errors
```

---

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Vercel Rate Limiting](https://vercel.com/docs/security/rate-limiting)

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2024  
**Reviewed By:** Codebase Analysis
