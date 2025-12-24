'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGetComments } from '@/hooks/useGetComments';

import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  reviewId: string;
}

export default function CommentSection({ reviewId }: CommentSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetComments(reviewId);

  const comments = data?.comments || [];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-medium'>Comments {comments.length > 0 && `(${comments.length})`}</h4>
        <Button variant='outline' size='sm' onClick={() => setShowForm(!showForm)}>
          <MessageCircle className='mr-1 h-4 w-4' />
          Add Comment
        </Button>
      </div>

      {showForm && (
        <CommentForm reviewId={reviewId} onCancel={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
      )}

      {isLoading && (
        <div className='py-4 text-center'>
          <div className='border-primary mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      )}

      {error && <p className='text-center text-sm text-red-500'>Failed to load comments</p>}

      {!isLoading && comments.length === 0 && (
        <p className='text-muted-foreground py-4 text-center text-sm'>No comments yet. Be the first to comment!</p>
      )}

      {comments.length > 0 && (
        <div className='space-y-4'>
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} reviewId={reviewId} />
          ))}
        </div>
      )}
    </div>
  );
}
