import React from 'react';
import { Modal } from './ui/Modal';
import RegisterForm from './RegisterForm';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const handleRegistrationSuccess = () => {
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<h2 className="text-2xl font-bold text-white">Inscription</h2>}
      maxWidth="lg"
    >
      <RegisterForm 
        onSuccess={handleRegistrationSuccess}
        onLoginClick={handleLoginClick}
      />
    </Modal>
  );
};

export default RegisterModal; 