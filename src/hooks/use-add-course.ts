import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface AddCourseData {
  code: string;
  name: string;
  description?: string;
  credits: string;
  difficulty: string;
  professorId: string;
}

export function useAddCourse() {
  const queryClient = useQueryClient();

  const { mutate: addCourse, isPending } = useMutation({
    mutationFn: async (data: AddCourseData) => {
      const response = await fetch('/api/courses', {
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
    onSuccess: () => {
      toast.success('Course added successfully');
      // Invalidate and refetch courses for this professor
      queryClient.invalidateQueries({ queryKey: ['courses'] });
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
