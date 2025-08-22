import { useState } from 'react';
import type { ToastType } from '@/components/common/Toast';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  actionText?: string;
  onActionPress?: () => void;
}

export function useToast() {
  const [toastConfig, setToastConfig] = useState<ToastConfig & { visible: boolean }>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });

  const showToast = (config: ToastConfig) => {
    setToastConfig({
      visible: true,
      type: 'info',
      duration: 3000,
      ...config
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({
      ...prev,
      visible: false
    }));
  };

  // 편의 메서드들
  const showSuccess = (message: string, actionText?: string, onActionPress?: () => void) => {
    showToast({ 
      message, 
      type: 'success', 
      actionText, 
      onActionPress 
    });
  };

  const showError = (message: string, actionText?: string, onActionPress?: () => void) => {
    showToast({ 
      message, 
      type: 'error', 
      actionText, 
      onActionPress 
    });
  };

  const showWarning = (message: string, actionText?: string, onActionPress?: () => void) => {
    showToast({ 
      message, 
      type: 'warning', 
      actionText, 
      onActionPress 
    });
  };

  const showInfo = (message: string, actionText?: string, onActionPress?: () => void) => {
    showToast({ 
      message, 
      type: 'info', 
      actionText, 
      onActionPress 
    });
  };

  return {
    toastConfig,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
