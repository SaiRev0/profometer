import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PROFESSOR_QUERY_KEY } from './use-professor';
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
      toast.success('Course added successfully');
      // Invalidate and refetch professor data
      queryClient.invalidateQueries({
        queryKey: PROFESSOR_QUERY_KEY(variables.professorId),
        refetchType: 'all'
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
