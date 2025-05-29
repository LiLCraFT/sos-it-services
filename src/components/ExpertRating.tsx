import React from 'react';
import { Star } from 'lucide-react';

interface ExpertRatingProps {
  rating?: number;
  className?: string;
}

export const ExpertRating: React.FC<ExpertRatingProps> = ({ rating, className = '' }) => {
  if (rating === undefined || rating <= 0) return null;
  return (
    <div className={`bg-[#2F3136]/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-400'} ${star === 1 ? '' : 'ml-0.5'}`}
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <span className="text-yellow-400 ml-1.5 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}; 