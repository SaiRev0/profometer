'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/hooks/useCreateComment';
import { useEditComment } from '@/hooks/useEditComment';
import { useRouter } from '@bprogress/next/app';

import { useSession } from 'next-auth/react';

interface CommentFormProps {
  reviewId: string;
  parentId?: string;
  editMode?: boolean;
  initialContent?: string;
  commentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  reviewId,
  parentId,
  editMode = false,
  initialContent = '',
  commentId,
  onCancel,
  onSuccess,
  placeholder = 'Write a comment...'
}: CommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { createComment, isLoading: isCreating } = useCreateComment();
  const { editComment, isLoading: isEditing } = useEditComment();

  const isLoading = isCreating || isEditing;

  // Auto-focus textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!session?.user) {
      router.push('/signin?error=Unauthorized');
      return;
    }

    if (!content.trim()) return;

    try {
      if (editMode && commentId) {
        await editComment({ commentId, content: content.trim(), reviewId });
      } else {
        await createComment({
          reviewId,
          parentId,
          content: content.trim()
        });
      }
      setContent('');
      onSuccess?.();
    } catch (error) {
      // Error handled by hooks
    }
  };

  if (!session?.user) {
    return (
      <div className='py-4 text-center'>
        <p className='text-muted-foreground mb-2 text-sm'>Sign in to comment</p>
        <Button size='sm' onClick={() => router.push('/signin')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className='resize-none'
      />
      <div className='flex items-center justify-end'>
        <div className='flex gap-2'>
          {onCancel && (
            <Button variant='outline' size='sm' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button size='sm' onClick={handleSubmit} disabled={isLoading || !content.trim()}>
            {isLoading ? 'Posting...' : editMode ? 'Update' : 'Post'}
          </Button>
        </div>
      </div>
      <p className='text-muted-foreground text-xs'>{content.length}/2000 characters</p>
    </div>
  );
}
