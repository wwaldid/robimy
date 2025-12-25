'use client';

import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: 'small' | 'large';
}

export default function ProductImage({ src, alt, className, size = 'small' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    const iconSize = size === 'large' ? 'w-32 h-32 mb-4' : 'w-24 h-24 mb-2';
    const textSize = size === 'large' ? 'text-lg font-medium' : 'text-sm font-medium';
    const text = size === 'large' ? 'Brak zdjęcia produktu' : 'Brak zdjęcia';

    return (
      <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <span className={textSize}>{text}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
