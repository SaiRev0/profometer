import * as React from 'react';

import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { X } from 'lucide-react';

// Wrapper for Dialog.Root that handles back button
interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  // eslint-disable-next-line no-unused-vars
  onOpenChange?: (open: boolean) => void;
  enableBackButton?: boolean;
}

function Dialog({ open, onOpenChange, enableBackButton = true, ...props }: DialogProps) {
  const historyPushedRef = React.useRef(false);
  const closingViaBackButtonRef = React.useRef(false);

  React.useEffect(() => {
    if (!enableBackButton) {
      return;
    }

    if (open) {
      // Dialog is opening - push a history state if we haven't already
      if (!historyPushedRef.current) {
        window.history.pushState({ dialogOpen: true }, '');
        historyPushedRef.current = true;
      }

      // Handle back button press
      const handlePopState = () => {
        if (open && onOpenChange) {
          closingViaBackButtonRef.current = true;
          onOpenChange(false);
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      // Dialog is closing
      if (historyPushedRef.current && !closingViaBackButtonRef.current) {
        // Dialog closed normally (not via back button), so remove the history state silently
        if (window.history.state?.dialogOpen) {
          window.history.replaceState(null, '', window.location.href);
        }
      }

      // Reset refs for next time
      historyPushedRef.current = false;
      closingViaBackButtonRef.current = false;
    }
  }, [open, onOpenChange, enableBackButton]);

  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props} />;
}

const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
    title?: string;
  }
>(({ className, children, hideClose, title = 'Dialog', ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200',
        className
      )}
      {...props}>
      <VisuallyHidden.Root>
        <DialogTitle>{title}</DialogTitle>
      </VisuallyHidden.Root>
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'>
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
