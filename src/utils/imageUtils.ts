export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return '/images/default-team.jpg';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return `${process.env.NEXT_PUBLIC_API_URL || ''}${imageUrl}`;
}; 