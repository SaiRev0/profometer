import { MetadataRoute } from 'next';

import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/department`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    }
  ];

  // Fetch all departments
  const departments = await db.department.findMany({
    select: {
      code: true,
      updatedAt: true
    }
  });

  // Fetch all professors
  const professors = await db.professor.findMany({
    select: {
      id: true,
      updatedAt: true
    }
  });

  // Fetch all courses
  const courses = await db.course.findMany({
    select: {
      code: true,
      updatedAt: true
    }
  });

  // Generate dynamic routes for departments
  const departmentRoutes = departments.map((dept) => ({
    url: `${baseUrl}/department/${dept.code}`,
    lastModified: dept.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7
  }));

  // Generate dynamic routes for professors
  const professorRoutes = professors.map((prof) => ({
    url: `${baseUrl}/professor/${prof.id}`,
    lastModified: prof.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7
  }));

  // Generate dynamic routes for courses
  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/course/${course.code}`,
    lastModified: course.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7
  }));

  return [...staticRoutes, ...departmentRoutes, ...professorRoutes, ...courseRoutes];
}
