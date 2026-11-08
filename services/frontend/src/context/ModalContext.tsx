import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ModalType = 'info' | 'success' | 'warning' | 'error';

interface ModalOptions {
  title?: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface ModalState {
  isOpen: boolean;
  isConfirm: boolean;
  title: string;
  message: string;
  type: ModalType;
  confirmText: string;
  cancelText: string;
  isDanger: boolean;
  resolve?: (value: boolean) => void;
}

interface ModalContextType {
  showAlert: (message: string, options?: ModalOptions | string) => Promise<void>;
  showConfirm: (message: string, options?: ModalOptions | string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    isConfirm: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: '확인',
    cancelText: '취소',
    isDanger: false,
  });

  const showAlert = useCallback((message: string, options?: ModalOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      let opt: ModalOptions = {};
      if (typeof options === 'string') {
        opt = { title: options };
      } else if (options) {
        opt = options;
      }

      setModalState({
        isOpen: true,
        isConfirm: false,
        title: opt.title || '알림',
        message,
        type: opt.type || 'info',
        confirmText: opt.confirmText || '확인',
        cancelText: '',
        isDanger: false,
        resolve: () => resolve(),
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, options?: ModalOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      let opt: ModalOptions = {};
      if (typeof options === 'string') {
        opt = { title: options };
      } else if (options) {
        opt = options;
      }

      setModalState({
        isOpen: true,
        isConfirm: true,
        title: opt.title || '확인',
        message,
        type: opt.type || (opt.isDanger ? 'warning' : 'info'),
        confirmText: opt.confirmText || '확인',
        cancelText: opt.cancelText || '취소',
        isDanger: opt.isDanger ?? false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getIconInfo = () => {
    switch (modalState.type) {
      case 'success':
        return { icon: 'check_circle', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10 border-[#4ade80]/20' };
      case 'warning':
        return { icon: 'warning', color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10 border-[#fbbf24]/20' };
      case 'error':
        return { icon: 'error', color: 'text-error', bg: 'bg-error-container/20 border-error/30' };
      case 'info':
      default:
        return { icon: 'info', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
    }
  };

  const iconInfo = getIconInfo();

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Global Modal Overlay */}
      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            {/* Header with Type Icon */}
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconInfo.bg} ${iconInfo.color}`}>
                <span className="material-symbols-outlined text-[22px]">{iconInfo.icon}</span>
              </div>
              <div className="flex flex-col min-w-0 pt-0.5">
                <h3 className="font-bold text-base text-on-surface leading-tight">
                  {modalState.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed whitespace-pre-line">
                  {modalState.message}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-outline-variant/20">
              {modalState.isConfirm && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all active:scale-95"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                  modalState.isDanger
                    ? 'bg-error text-white hover:brightness-110 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-primary text-on-primary hover:brightness-110 shadow-[0_0_12px_rgba(77,142,255,0.4)]'
                }`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
