import { useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * PhotoLightbox – fullscreen enlarged photo viewer.
 *
 * Props:
 *   src        {string}   – image URL to display
 *   alt        {string}   – alt text
 *   onClose    {function} – called when the user dismisses the lightbox
 *   onPrev     {function} – (optional) navigate to previous photo
 *   onNext     {function} – (optional) navigate to next photo
 */
export default function PhotoLightbox({ src, alt, onClose, onPrev, onNext }) {
  // Close on Escape; navigate with arrow keys when callbacks are provided
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Prev arrow */}
      {onPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous photo"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Next arrow */}
      {onNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next photo"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Image – clicking the image itself doesn't close the lightbox */}
      <img
        src={src}
        alt={alt || 'Photo'}
        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
