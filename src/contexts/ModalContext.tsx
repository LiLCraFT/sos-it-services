import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterModal from '../components/RegisterModal';
import { Modal } from '../components/ui/Modal';

interface ModalContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{ openLoginModal, openRegisterModal, closeModals }}>
      {children}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={closeModals}
        title={<h2 className="text-2xl font-bold text-white">Connexion</h2>}
        maxWidth="md"
      >
        <LoginForm onSuccess={closeModals} onRegisterClick={openRegisterModal} />
      </Modal>
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 