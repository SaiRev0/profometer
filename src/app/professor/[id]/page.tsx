import ProfessorClientWrapper from '@/app/professor/_UI/professor-client-wrapper';

export default async function ProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProfessorClientWrapper id={id} />;
}
