import { create } from 'zustand';

interface GlobalAlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;

  showAlert: (config: {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;

  hideAlert: () => void;
}

export const useGlobalAlertStore = create<GlobalAlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  type: 'danger',
  onConfirm: undefined,
  onCancel: undefined,
  confirmText: undefined,
  cancelText: undefined,

  showAlert: (config) => {
    set({
      visible: true,
      title: config.title,
      message: config.message,
      type: config.type || 'danger',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
    });
  },

  hideAlert: () => {
    set({
      visible: false,
      title: '',
      message: '',
      type: 'danger',
      onConfirm: undefined,
      onCancel: undefined,
      confirmText: undefined,
      cancelText: undefined,
    });
  },
}));
