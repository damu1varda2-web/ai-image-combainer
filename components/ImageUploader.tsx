import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  label: string;
  icon: React.ReactNode;
  imagePreview: string | null;
  onImageUpload: (base64: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, icon, imagePreview, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow re-uploading the same file
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload(null);
  }, [onImageUpload]);

  const handleUploaderClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleUploaderClick}
      className="relative aspect-square w-full bg-slate-100 border border-base-300 rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer group hover:border-brand-primary transition-colors"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      {imagePreview ? (
        <>
          <img src={imagePreview} alt={label} className="w-full h-full object-cover rounded-md" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${label} image`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-text-secondary">
          <div className="w-6 h-6">{icon}</div>
          <span className="text-xs font-medium">{label}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;