import React from 'react';

/**
 * ResponsiveImage Component
 * Renders modern AVIF and WebP sources with universal fallback,
 * explicit dimensions for zero layout shift (CLS = 0), and async decoding.
 */
export const ResponsiveImage = ({
  src,
  alt = '',
  width,
  height,
  avifSrcSet,
  webpSrcSet,
  sizes = '100vw',
  loading = 'lazy',
  decoding = 'async',
  fetchpriority = 'auto',
  className = '',
  style = {},
  aspectRatio,
  onError,
}) => {
  const imageStyle = {
    ...style,
    ...(aspectRatio ? { aspectRatio } : width && height ? { aspectRatio: `${width}/${height}` } : {}),
  };

  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchpriority={fetchpriority}
        className={className}
        style={imageStyle}
        onError={onError}
      />
    </picture>
  );
};

export default ResponsiveImage;
