import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/useSearch';

import { BookOpen, Building2, GraduationCap, Search, User, XIcon } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export function SearchDialog({ open, onOpenChange, searchTerm, setSearchTerm }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading, error } = useSearch(searchTerm);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm(''); // Clear search term when dialog closes
    }
    onOpenChange(newOpen);
  };

  const handleSelect = (type: 'professor' | 'department' | 'course', id: string) => {
    onOpenChange(false);
    switch (type) {
      case 'professor':
        router.push(`/professor/${id}`);
        break;
      case 'department':
        router.push(`/department/${id}`);
        break;
      case 'course':
        router.push(`/course/${id}`);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className='top-0 max-h-[100vh] translate-y-0 p-0 sm:top-[50%] sm:max-h-[80vh] sm:max-w-[600px] sm:-translate-y-[50%]'>
        <div className='border-b p-4'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              ref={inputRef}
              placeholder='Search professors, departments, and courses...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => onOpenChange(false)}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-0 -translate-y-1/2'
              aria-label='Close'>
              <XIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <ScrollArea className='max-h-[calc(100vh-80px)] sm:max-h-[60vh]'>
          {isLoading && <div className='text-muted-foreground p-4 pt-0 text-center'>Searching...</div>}
          {error && <div className='text-destructive p-4 pt-0 text-center'>Error: {error}</div>}
          {!isLoading && !error && (
            <div className='divide-y'>
              {results.popularDepartments.length === 0 &&
                results.departments.length === 0 &&
                results.professors.length === 0 &&
                results.courses.length === 0 && (
                  <div className='text-muted-foreground p-4 pt-0 text-center'>No results found.</div>
                )}

              {results.popularDepartments.length > 0 && (
                <div className='p-2'>
                  <h3 className='text-muted-foreground px-2 pb-1.5 text-sm font-semibold'>Popular Searches</h3>
                  {results.popularDepartments.map((dept) => (
                    <Button
                      key={dept.code}
                      variant='ghost'
                      size='lg'
                      className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full justify-start px-4 py-2 focus:outline-none'
                      onClick={() => handleSelect('department', dept.code)}>
                      <div className='flex items-center gap-3'>
                        <Building2 className='h-4 w-4' />
                        <div className='flex flex-col gap-0'>
                          <span className='font-medium'>{dept.name}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {results.departments.length > 0 && (
                <div className='p-2'>
                  <h3 className='text-muted-foreground px-2 pb-1.5 text-sm font-semibold'>Departments</h3>
                  {results.departments.map((dept) => (
                    <Button
                      key={dept.code}
                      variant='ghost'
                      size='lg'
                      className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full justify-start px-4 py-2 focus:outline-none'
                      onClick={() => handleSelect('department', dept.code)}>
                      <div className='flex items-center gap-3'>
                        <Building2 className='h-4 w-4' />
                        <div className='flex flex-col'>
                          <span className='font-medium'>{dept.name}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {results.professors.length > 0 && (
                <div className='p-2'>
                  <h3 className='text-muted-foreground px-2 pb-1.5 text-sm font-semibold'>Professors</h3>
                  {results.professors.map((prof) => (
                    <Button
                      key={prof.id}
                      variant='ghost'
                      size='lg'
                      className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full justify-start px-4 py-2 focus:outline-none'
                      onClick={() => handleSelect('professor', prof.id)}>
                      <div className='flex items-center gap-3'>
                        <User className='h-4 w-4' />
                        <div className='flex flex-col text-left'>
                          <span className='font-medium'>{prof.name}</span>
                          {prof.department && (
                            <span className='text-muted-foreground font text-sm'>{prof.department.name}</span>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {results.courses.length > 0 && (
                <div className='p-2'>
                  <h3 className='text-muted-foreground px-2 pb-1.5 text-sm font-semibold'>Courses</h3>
                  {results.courses.map((course) => (
                    <Button
                      key={course.code}
                      variant='ghost'
                      size='lg'
                      className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full justify-start px-4 py-2 focus:outline-none'
                      onClick={() => handleSelect('course', course.code)}>
                      <div className='flex items-center gap-3'>
                        <BookOpen className='h-4 w-4' />
                        <div className='flex flex-col text-left'>
                          <span className='font-medium'>
                            {course.code}: {course.name}
                          </span>
                          {course.department && (
                            <span className='text-muted-foreground text-sm'>{course.department.name}</span>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
