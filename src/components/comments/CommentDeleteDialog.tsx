'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useDeleteComment } from '@/hooks/useDeleteComment';

interface CommentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: string;
  reviewId: string;
}

export default function CommentDeleteDialog({ open, onOpenChange, commentId, reviewId }: CommentDeleteDialogProps) {
  const { deleteComment, isLoading } = useDeleteComment();

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId, reviewId });
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone. Any replies to this comment will
            also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className='bg-red-500 hover:bg-red-600'>
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
