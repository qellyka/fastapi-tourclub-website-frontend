'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isAuthModalOpen: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const showAuthModal = () => setIsAuthModalOpen(true);
  const hideAuthModal = () => setIsAuthModalOpen(false);

  return (
    <ModalContext.Provider value={{ isAuthModalOpen, showAuthModal, hideAuthModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}