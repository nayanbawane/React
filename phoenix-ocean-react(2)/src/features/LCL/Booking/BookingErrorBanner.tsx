import { useEffect, useRef } from 'react';
import { PStatusBar, PConfirmationModal } from 'phoenix-react-lib';
import styles from './booking.module.css';

type BookingErrorBannerVariant = 'bar' | 'modal';

interface Props {
  messages: string[];
  onClose: (message: string[]) => void;
  autoHideMs?: number;
  variant?: BookingErrorBannerVariant;
}

interface StatusBarItemProps {
  message: string;
  onClose: (message: string[]) => void;
  autoHideMs: number;
}

const StatusBarItem = ({ message, onClose, autoHideMs }: StatusBarItemProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose([message]);
    }, autoHideMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, autoHideMs, onClose]);

  return (
    <PStatusBar
      type="warning"
      messages={[message]}
      onClose={onClose}
      isVisible={true}
    />
  );
};

const BookingErrorBanner = ({ messages, onClose, autoHideMs = 3000, variant = 'bar' }: Props) => {
  if (!messages || messages.length === 0) return null;

  if (variant === 'modal') {
    return (
      <PConfirmationModal
        open={true}
        variant="warning"
        title="Validation Error"
        message={messages.join('\n')}
        primaryAction={{
          label: 'Close',
          onClick: () => onClose(messages),
        }}
        onClose={() => onClose(messages)}
        buttonAlign="end"
      />
    );
  }

  return (
    <div className={styles.bookingErrorBannerContainer}>
      {messages.map(message => (
        <StatusBarItem
          key={message}
          message={message}
          onClose={onClose}
          autoHideMs={autoHideMs}
        />
      ))}
    </div>
  );
};

export default BookingErrorBanner;
