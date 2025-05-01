'use client';

import { useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { Professor } from '@/lib/types';

import { Button } from '../ui/button';
import { toast } from 'sonner';

interface CourseFormProps {
  professor: Professor;
  modalState: boolean;
  setModalState: (state: boolean) => void;
}

function CourseForm({ professor, modalState, setModalState }: CourseFormProps) {
  // Add new state for course modal
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('3');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState('3');

  // Function to handle adding a new course
  const handleAddCourse = () => {
    if (!newCourseCode || !newCourseName) {
      toast.error('Please provide both course code and name');
      return;
    }

    // Add the new course to professor's courses
    professor.courses = [
      ...professor.courses,
      {
        id: '',
        professorId: professor.id,
        code: newCourseCode.toUpperCase(),
        name: newCourseName,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: []
      }
    ];

    // Reset form and close dialog
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseDescription('');
    setNewCourseCredits('3');
    setNewCourseDifficulty('3');
    setModalState(false);

    toast.success('Course added successfully');
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
              <Label htmlFor='credits'>Credits</Label>
              <Select value={newCourseCredits} onValueChange={setNewCourseCredits}>
                <SelectTrigger>
                  <SelectValue placeholder='Select credits' />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5'].map((credit) => (
                    <SelectItem key={credit} value={credit}>
                      {credit} {parseInt(credit) === 1 ? 'Credit' : 'Credits'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Button onClick={handleAddCourse}>Add Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CourseForm;
