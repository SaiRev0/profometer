'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useDeleteReview } from '@/hooks/useDeleteReview';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
}

export function DeleteDialog({ open, onOpenChange, reviewId }: DeleteDialogProps) {
  const { deleteReview, isLoading } = useDeleteReview();

  const handleDelete = async () => {
    await deleteReview({ reviewId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Trash2 className='text-destructive h-5 w-5' />
            Delete Review
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
