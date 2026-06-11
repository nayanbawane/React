import { useRef } from 'react';

type ShowStatusType = (
  type: 'error' | 'success' | 'warning' | 'info',
  messages: string[]
) => void;

export const useEmailValidation = (
  showStatus: ShowStatusType
) => {
  const barRef = useRef<HTMLDivElement>(null);

const validateEmail = (
  value: string,
  onInvalid: () => void
) => {
  if (!value?.trim()) return true;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const emails = value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const invalidEmails = emails.filter(
    (email) => !emailRegex.test(email)
  );

  if (invalidEmails.length > 0) {
    showStatus('warning', [
      `Please enter valid email address`
    ]);

    onInvalid();

    return false;
  }

  return true;
};

  return {
    validateEmail,
    barRef,
  };
};