import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

interface AddCourseData {
  code: string;
  name: string;
  description?: string;
  credits: string;
  departmentId: string;
}

export function useAddCourse() {
  const { mutateAsync: addCourse, isPending } = useMutation({
    mutationFn: async (data: AddCourseData) => {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Course added successfully', {
        description: 'It will be verified soon'
      });
    },
    onError: () => {
      toast.error('Failed to add course');
    }
  });

  return {
    addCourse,
    isLoading: isPending
  };
}
