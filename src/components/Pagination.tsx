import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Ne rien afficher s'il n'y a qu'une seule page
  if (totalPages <= 1) {
    return null;
  }

  // Calculer les pages à afficher
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si le nombre total est inférieur ou égal au maximum
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      // Calculer la plage de pages à afficher
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Ajuster si on est près du début
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Ajuster si on est près de la fin
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Ajouter une ellipse après la première page si nécessaire
      if (startPage > 2) {
        pages.push('ellipsis1');
      }
      
      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Ajouter une ellipse avant la dernière page si nécessaire
      if (endPage < totalPages - 1) {
        pages.push('ellipsis2');
      }
      
      // Toujours afficher la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      {/* Bouton première page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors'
        }`}
        aria-label="Première page"
      >
        <ChevronsLeft className="w-5 h-5" />
      </button>
      
      {/* Bouton page précédente */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors'
        }`}
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {/* Numéros de page */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis1' || page === 'ellipsis2') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                ...
              </span>
            );
          }
          
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                currentPage === page
                  ? 'bg-[#5865F2] text-white'
                  : 'text-gray-300 hover:bg-[#36393F]'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      {/* Bouton page suivante */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors'
        }`}
        aria-label="Page suivante"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Bouton dernière page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors'
        }`}
        aria-label="Dernière page"
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
      
      {/* Information de pagination */}
      <div className="ml-4 text-sm text-gray-400">
        Page <span className="font-medium text-white">{currentPage}</span> sur <span className="font-medium text-white">{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination; 