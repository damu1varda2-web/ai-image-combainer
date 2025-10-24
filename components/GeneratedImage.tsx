import React, { useState, useEffect } from 'react';
import { SparklesIcon, DownloadIcon, TrashIcon } from './Icons';
import { AspectRatio, Creation } from '../types';

interface GeneratedImageProps {
  creation: Creation | null;
  isLoading: boolean;
  aspectRatio: AspectRatio;
  onDelete: () => void;
}

const loadingMessages = [
  "Composing the elements...",
  "Applying artistic style...",
  "Adjusting lighting and shadows...",
  "Rendering the final masterpiece...",
  "Almost there..."
];

const GeneratedImage: React.FC<GeneratedImageProps> = ({ creation, isLoading, aspectRatio, onDelete }) => {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let i = 0;
      setCurrentMessage(loadingMessages[i]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDownload = () => {
    if (creation?.imageUrl) {
      const link = document.createElement('a');
      link.href = creation.imageUrl;
      const fileName = creation.prompt.substring(0, 30).replace(/\s/g, '_') || 'ai-composition';
      link.download = `${fileName}-${creation.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      case '1:1':
      default:
        return 'aspect-square';
    }
  }
  
  const containerClass = `w-full max-w-2xl flex flex-col gap-4`;

  return (
    <div className={containerClass}>
        <div className="h-12 flex items-center justify-end">
             {creation && !isLoading && (
                <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg shadow-sm border border-base-300">
                    <button
                        onClick={handleDownload}
                        className="p-2 text-text-secondary hover:text-brand-primary hover:bg-slate-100 rounded-md transition-colors"
                        aria-label="Download Image"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                    <div className="h-6 border-l border-base-300"></div>
                     <button
                        onClick={onDelete}
                        className="p-2 text-text-secondary hover:text-red-500 hover:bg-slate-100 rounded-md transition-colors"
                        aria-label="Delete Image"
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                </div>
             )}
        </div>
        <div className={`w-full bg-base-200 rounded-lg flex items-center justify-center p-1 sm:p-2 border border-base-300 shadow-md ${getAspectRatioClass(aspectRatio)}`}>
        {isLoading && (
            <div className="text-center space-y-4 p-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                <div className="absolute inset-0 bg-brand-secondary rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-brand-primary rounded-full flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">Generating your image...</h3>
            <p className="text-sm text-text-secondary transition-opacity duration-500">{currentMessage}</p>
            </div>
        )}
        {!isLoading && creation && (
            <div className="relative w-full h-full group">
            <img src={creation.imageUrl} alt={creation.prompt} className="w-full h-full object-contain rounded-md" />
            </div>
        )}
        {!isLoading && !creation && (
            <div className="text-center text-text-secondary space-y-2 p-4">
            <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">Your creation will appear here</h3>
            <p className="text-sm sm:text-base">Describe your scene and let the AI work its magic.</p>
            </div>
        )}
        </div>
    </div>
  );
};

export default GeneratedImage;
