'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useReportComment } from '@/hooks/useReportComment';

interface CommentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: string;
}

const REPORT_REASONS = [
  'Spam or advertising',
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Inappropriate content',
  'False information',
  'Other'
];

export default function CommentReportDialog({ open, onOpenChange, commentId }: CommentReportDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const { reportComment, isLoading } = useReportComment();

  const handleSubmit = async () => {
    if (!reason) return;

    try {
      await reportComment({ commentId, reason, details: details || undefined });
      onOpenChange(false);
      setReason('');
      setDetails('');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
          <DialogDescription>Please select a reason for reporting this comment.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r} className='flex items-center space-x-2'>
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r}>{r}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className='space-y-2'>
            <Label htmlFor='details'>Additional details (optional)</Label>
            <Textarea
              id='details'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder='Provide more context...'
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !reason}>
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
