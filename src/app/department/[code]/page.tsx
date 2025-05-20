import DepartmentClientWrapper from '@/app/department/_UI/department-client-wrapper';

export default async function DepartmentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return <DepartmentClientWrapper code={code} />;
}
