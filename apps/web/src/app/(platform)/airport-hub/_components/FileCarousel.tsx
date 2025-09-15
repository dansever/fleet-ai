'use client';

import { formatFileSize } from '@/lib/core/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, File } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

const noScrollbarCSS = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface FileCarouselProps {
  files: Array<{
    name: string;
    size: number;
    type: string;
    action: () => void;
    isSelected?: boolean;
  }>;
}

export const FileCarousel: React.FC<FileCarouselProps> = ({ files }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
      return () => carousel.removeEventListener('scroll', updateScrollButtons);
    }
  }, [carouselRef.current]); // Added carouselRef.current as a dependency

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;

      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{noScrollbarCSS}</style>
      <div className="relative w-full rounded-3xl backdrop-blur-xl">
        <motion.div
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide p-4 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {files.map((file, index) => (
            <motion.div key={index} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              {
                <FileCard
                  name={file.name}
                  size={file.size}
                  type={file.type.toLowerCase()}
                  onClick={file.action}
                  isSelected={file.isSelected}
                />
              }
            </motion.div>
          ))}
        </motion.div>
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg transition-colors hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg transition-colors hover:bg-white"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

interface FileCardProps {
  name: string;
  size: number;
  type: string;
  onClick: () => void;
  isSelected?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ name, size, type, onClick, isSelected }) => {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-2xl p-2 shadow-md cursor-pointer flex flex-col justify-between transition-colors duration-300 hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-2 border-blue-500 shadow-lg' : 'bg-white'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-row items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <File className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex flex-col items-start">
          <p className="font-semibold text-gray-800 font-figtree max-w-[180px] overflow-hidden text-ellipsis">
            {name}
          </p>
          <p className="text-gray-600 text-sm font-figtree font-light">{type}</p>
          <p className="text-gray-600 text-sm font-figtree font-light">{formatFileSize(size)}</p>
        </div>
      </div>
    </motion.div>
  );
};
