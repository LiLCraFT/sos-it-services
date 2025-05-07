import React from 'react';

interface ImageCardProps {
  imageUrl: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  alt,
  className = '',
  fallbackImage = '/images/default-team.jpg'
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', imageUrl);
    e.currentTarget.src = fallbackImage;
  };

  return (
    <div className={`relative w-full h-64 overflow-hidden rounded-t-lg ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    </div>
  );
}; 