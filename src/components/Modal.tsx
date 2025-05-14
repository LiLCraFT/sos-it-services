import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'md' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Gestion des clics en dehors du modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  // Effet d'animation
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      modalContentRef.current.classList.add('modal-enter-active');
      
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.classList.remove('modal-enter-active');
          modalContentRef.current.classList.add('modal-entered');
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-md';
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto"
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
    >
      <style jsx global>{`
        .modal-enter-active {
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
        }
        .modal-entered {
          opacity: 1;
          transform: scale(1);
          transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
        }
      `}</style>
    
      <div 
        ref={modalContentRef}
        className={`relative w-full ${getMaxWidthClass()} bg-[#36393F] rounded-lg shadow-xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#202225] flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-[#202225] rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer - optionnel, ajouté si nécessaire */}
      </div>
    </div>
  );
}; 