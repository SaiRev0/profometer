import ProfessorCard, { Professor } from '@/components/cards/professor-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ArrowUpDown, ThumbsUp } from 'lucide-react';

interface LovedChallengingSectionProps {
    professors: Professor[];
    isLoading: boolean;
}

export default function LovedChallengingSection({ professors, isLoading }: LovedChallengingSectionProps) {
    const lovedProfessors = professors
        .filter((p) => p.rating >= 4.3)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

    const challengingProfessors = professors
        .filter((p) => p.difficultyLevel && p.difficultyLevel >= 4.0)
        .sort((a, b) => (b.difficultyLevel || 0) - (a.difficultyLevel || 0))
        .slice(0, 3);

    return (
        <section className='mt-8'>
            <h2 className='mb-6 text-2xl font-bold'>Most Loved vs Most Challenging</h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Most Loved Professors */}
                <Card className='border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-emerald-600 dark:text-emerald-400'>
                            <ThumbsUp className='h-5 w-5' />
                            Most Loved Professors
                        </CardTitle>
                        <CardDescription>
                            These professors consistently receive top ratings from students.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, index) => (
                                  <ProfessorCard
                                      key={index}
                                      professor={professors[0]}
                                      isLoading={true}
                                      variant='detailed'
                                  />
                              ))
                            : lovedProfessors.map((professor) => (
                                  <ProfessorCard key={professor.id} professor={professor} variant='detailed' />
                              ))}
                    </CardContent>
                </Card>

                {/* Most Challenging Professors */}
                <Card className='border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-red-600 dark:text-red-400'>
                            <ArrowUpDown className='h-5 w-5' />
                            Most Challenging Professors
                        </CardTitle>
                        <CardDescription>
                            Students find these professors' courses particularly demanding.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, index) => (
                                  <ProfessorCard
                                      key={index}
                                      professor={professors[0]}
                                      isLoading={true}
                                      variant='detailed'
                                  />
                              ))
                            : challengingProfessors.map((professor) => (
                                  <ProfessorCard key={professor.id} professor={professor} variant='detailed' />
                              ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
