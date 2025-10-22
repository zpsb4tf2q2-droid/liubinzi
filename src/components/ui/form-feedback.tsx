import { cn } from '@/lib/utils';

type FormFeedbackProps = {
  message?: string | null;
  variant?: 'error' | 'success';
};

const FormFeedback = ({ message, variant = 'error' }: FormFeedbackProps) => {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn('text-sm', variant === 'error' ? 'text-red-600' : 'text-green-600')}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      {message}
    </p>
  );
};

export default FormFeedback;
