import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        className="px-3 py-1 rounded-md bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Précédent
      </button>
      {getPages().map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded-md bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Suivant
      </button>
    </div>
  );
};

export default Pagination; 