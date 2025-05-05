'use client';

import { useState } from 'react';

import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useAddCourse } from '@/hooks/use-add-course';
import { PROFESSOR_QUERY_KEY } from '@/hooks/use-professor';
import { Professor } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '../ui/button';
import { toast } from 'sonner';

interface CourseFormProps {
  professor: Professor;
  modalState: boolean;
  setModalState: (state: boolean) => void;
}

function CourseForm({ professor, modalState, setModalState }: CourseFormProps) {
  const { addCourse, isLoading } = useAddCourse();
  const queryClient = useQueryClient();

  // Add new state for course modal
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('3');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState('3');
  const [showCreditsHelp, setShowCreditsHelp] = useState(false);

  // Function to handle adding a new course
  const handleAddCourse = async () => {
    if (!newCourseCode || !newCourseName) {
      toast.error('Please provide both course code and name');
      return;
    }

    try {
      await addCourse({
        code: newCourseCode,
        name: newCourseName,
        description: newCourseDescription,
        credits: newCourseCredits,
        difficulty: newCourseDifficulty,
        professorId: professor.id
      });
      queryClient.invalidateQueries({ queryKey: PROFESSOR_QUERY_KEY(professor.id) });
      // Reset form and close dialog
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseDescription('');
      setNewCourseCredits('9');
      setNewCourseDifficulty('3');
      setModalState(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to add course:', error);
    }
  };

  return (
    <Dialog open={modalState} onOpenChange={setModalState}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Add a new course that you took with this professor. This will help other students find and review the
            course.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='courseCode'>Course Code</Label>
              <Input
                id='courseCode'
                placeholder='e.g., CS101'
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor='credits'>
                Credits: {newCourseCredits}
                <span
                  className='ml-2 cursor-pointer text-sm text-blue-600 underline'
                  onClick={() => setShowCreditsHelp(true)}>
                  Don't know?
                </span>
              </Label>
              <Slider
                id='credits'
                min={2}
                max={13}
                step={1}
                value={[parseInt(newCourseCredits)]}
                onValueChange={(value) => setNewCourseCredits(value[0].toString())}
                className='mt-2'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='courseName'>Course Name</Label>
            <Input
              id='courseName'
              placeholder='e.g., Introduction to Computer Science'
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor='courseDescription'>Course Description (Optional)</Label>
            <Textarea
              id='courseDescription'
              placeholder='Brief description of the course...'
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor='difficulty'>Expected Difficulty</Label>
            <Select value={newCourseDifficulty} onValueChange={setNewCourseDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder='Select difficulty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1'>Very Easy</SelectItem>
                <SelectItem value='2'>Easy</SelectItem>
                <SelectItem value='3'>Moderate</SelectItem>
                <SelectItem value='4'>Challenging</SelectItem>
                <SelectItem value='5'>Very Challenging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setModalState(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCourse} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Course'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={showCreditsHelp} onOpenChange={setShowCreditsHelp}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>How to Find Course Credits</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <ol className='list-inside list-decimal space-y-1'>
              <li>
                Visit the{' '}
                <a
                  href='https://prev.iitbhu.ac.in/dept'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'>
                  IIT BHU Department Page
                </a>
              </li>
              <li>Select your course department</li>
              <li>Then click on your course on the top bar to view details</li>
            </ol>
            <div>
              <Image
                src='/images/courceCredit.png'
                alt='How to find credits'
                width={400}
                height={150}
                className='w-full rounded border'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreditsHelp(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default CourseForm;
