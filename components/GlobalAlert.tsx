import { CustomAlert } from '@/components/CustomAlert';
import { useGlobalAlertStore } from '@/lib/store/globalAlertStore';
import React from 'react';

export function GlobalAlert() {
  const {
    visible,
    title,
    message,
    type,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    hideAlert,
  } = useGlobalAlertStore();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    hideAlert();
  };

  return (
    <CustomAlert
      visible={visible}
      title={title}
      message={message}
      type={type}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  );
}
