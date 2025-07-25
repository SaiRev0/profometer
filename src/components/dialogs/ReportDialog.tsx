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
import { useReportReview } from '@/hooks/useReportReview';

import { Flag } from 'lucide-react';
import { toast } from 'sonner';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  professorId?: string;
  courseCode?: string;
}

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate or offensive content' },
  { id: 'spam', label: 'Spam or misleading information' },
  { id: 'notRelevant', label: 'Not related to this professor' },
  { id: 'fake', label: 'Suspected fake review' },
  { id: 'other', label: 'Other reason' }
];

export function ReportDialog({ open, onOpenChange, reviewId, professorId, courseCode }: ReportDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const { reportReview, isLoading } = useReportReview();

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason', {
        description: 'You must select a reason for reporting this review.'
      });
      return;
    }

    await reportReview({
      reviewId,
      reason,
      details
    });

    onOpenChange(false);
    // Reset form
    setReason('');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Flag className='text-destructive h-5 w-5' />
            Report Review
          </DialogTitle>
          <DialogDescription>
            Please let us know why you're reporting this review. All reports are anonymous and reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((item) => (
              <div key={item.id} className='flex items-center space-x-2 py-1'>
                <RadioGroupItem value={item.id} id={item.id} />
                <Label htmlFor={item.id}>{item.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className='mt-4'>
            <Label htmlFor='details'>Additional details (optional)</Label>
            <Textarea
              id='details'
              placeholder='Please provide any additional information that might help us understand this report...'
              className='mt-1.5'
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason || isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
