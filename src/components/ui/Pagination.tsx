import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  console.log('Pagination render:', { currentPage, totalPages });

  const handlePageClick = (page: number) => {
    console.log('Page clicked:', page);
    onPageChange(page);
  };

  const handlePrevClick = () => {
    console.log('Prev clicked');
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    console.log('Next clicked');
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        type="button"
        className="px-3 py-1 rounded-md bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white disabled:opacity-50 pointer-events-auto z-[9999]"
        onClick={handlePrevClick}
        disabled={currentPage === 1}
      >
        Précédent
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          className={`px-3 py-1 rounded-md pointer-events-auto z-[9999] ${
            page === currentPage
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          }`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}
      
      <button
        type="button"
        className="px-3 py-1 rounded-md bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white disabled:opacity-50 pointer-events-auto z-[9999]"
        onClick={handleNextClick}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Suivant
      </button>
    </div>
  );
};

export default Pagination; 