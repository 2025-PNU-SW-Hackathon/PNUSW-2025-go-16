import { useState } from 'react';

export function useEnterModal() {
  const [message, setMessage] = useState('');

  const handleConfirm = (event: any, onClose: () => void) => {
    // TODO: 실제 참여 로직 구현
    console.log('참여 확정:', { event, message });
    onClose();
    setMessage('');
  };

  const handleCancel = (onClose: () => void) => {
    onClose();
    setMessage('');
  };

  const resetMessage = () => {
    setMessage('');
  };

  return {
    message,
    setMessage,
    handleConfirm,
    handleCancel,
    resetMessage,
  };
} 