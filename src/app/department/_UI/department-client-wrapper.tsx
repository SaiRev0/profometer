'use client';

import { notFound } from 'next/navigation';

import DepartmentDetails from '@/components/department';
import DepartmentSkeleton from '@/components/department/DepartmentDetailsSkeleton';
import { useGetDepartmentByCode } from '@/hooks/useGetDepartmentByCode';

export default function DepartmentClientWrapper({ code }: { code: string }) {
  const { data: department, isLoading, error } = useGetDepartmentByCode({ code });

  if (isLoading) {
    return <DepartmentSkeleton />;
  }

  if (error || !department) {
    notFound();
  }

  return <DepartmentDetails department={department} />;
}
