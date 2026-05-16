import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  fallback: string;
  alt: string;
}

/**
 * Componente de imagen con fallback automático
 *
 * 🖼️ USO:
 * <ImageWithFallback
 *   src={book.cover_image_url}
 *   fallback="/placeholder-book.jpg"
 *   alt={book.title}
 *   className="w-full h-full object-cover"
 * />
 */
export function ImageWithFallback({
  src,
  fallback,
  alt,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const imageSrc = error || !src ? fallback : src;

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] animate-pulse flex items-center justify-center">
          <span className="text-white text-4xl opacity-30">📖</span>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        {...props}
      />
    </div>
  );
}
