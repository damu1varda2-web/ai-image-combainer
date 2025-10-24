import React, { useState, useCallback } from 'react';
import { ImageSlot, StyleOption, AspectRatio, Creation } from './types';
import { createCreation, deleteCreation } from './services/imageService';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import { CameraIcon, PersonIcon, WorldIcon, CubeIcon, SparklesIcon, ShareIcon, UserCircleIcon, AspectRatioSquareIcon, AspectRatioPortraitIcon, AspectRatioLandscapeIcon } from './components/Icons';

const App: React.FC = () => {
  const [imageSlots, setImageSlots] = useState<ImageSlot>({
    person: null,
    background: null,
    object: null,
    accessory: null,
  });
  const [prompt, setPrompt] = useState<string>('A panda riding a bike through a city with depth of field');
  const [selectedStyle, setSelectedStyle] = useState<string>('Realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [currentCreation, setCurrentCreation] = useState<Creation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const styleOptions: StyleOption[] = [
    { name: 'Realistic', preview: 'https://picsum.photos/id/1062/100/100' },
    { name: 'Cinematic', preview: 'https://picsum.photos/id/1015/100/100' },
    { name: 'Cartoon', preview: 'https://picsum.photos/id/1025/100/100' },
    { name: 'Cyberpunk', preview: 'https://picsum.photos/id/1078/100/100' },
    { name: 'Fantasy', preview: 'https://picsum.photos/id/10/100/100' },
    { name: 'Watercolor', preview: 'https://picsum.photos/id/488/100/100' },
    { name: 'Pixel Art', preview: 'https://picsum.photos/id/342/100/100' },
    { name: 'Abstract', preview: 'https://picsum.photos/id/99/100/100' },
  ];

  const handleImageUpload = (slot: keyof ImageSlot, base64: string | null) => {
    setImageSlots(prev => ({ ...prev, [slot]: base64 }));
  };

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCurrentCreation(null);
    try {
      const newCreation = await createCreation(imageSlots, prompt, selectedStyle, aspectRatio);
      setCurrentCreation(newCreation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageSlots, prompt, selectedStyle, aspectRatio]);

  const handleDeleteImage = useCallback(async () => {
    if (!currentCreation) return;
    const creationIdToDelete = currentCreation.id;
    setCurrentCreation(null); // Optimistic UI update
    try {
        await deleteCreation(creationIdToDelete);
    } catch (err) {
        console.error("Failed to delete creation:", err);
        setError("Could not delete the image. Please try again.");
        // Note: In a real app, you might want to restore the `currentCreation` state on failure.
    }
  }, [currentCreation]);

  const handleShare = async () => {
    if (!currentCreation?.shareUrl) return;

    const shareData = {
        title: 'AI Image Composition',
        text: 'Check out this image I created with the AI Image Composer!',
        url: currentCreation.shareUrl,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(currentCreation.shareUrl);
        alert('Share URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('An error occurred while trying to share.');
    }
  };


  const canGenerate = Object.values(imageSlots).some(img => img !== null) || prompt.trim() !== '';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-base-100 text-text-primary">
      <header className="flex items-center justify-between py-2 px-4 bg-base-200 border-b border-base-300 shadow-sm z-10">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-brand-primary" />
          AI Image Composer
        </h1>
        <div className="flex items-center gap-2">
            <button
                onClick={handleShare}
                disabled={!currentCreation || isLoading}
                className="flex items-center gap-2 py-2 px-4 font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
                <ShareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
            </button>
            <UserCircleIcon className="w-10 h-10 text-slate-400" />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-[380px] lg:shrink-0 bg-base-200 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-base-300 space-y-6 lg:overflow-y-auto">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">Magic Media</h2>
            <p className="text-sm text-text-secondary">Compose your image by uploading elements or describing your scene.</p>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <ImageUploader label="Person" icon={<PersonIcon />} imagePreview={imageSlots.person} onImageUpload={(base64) => handleImageUpload('person', base64)} />
            <ImageUploader label="Background" icon={<WorldIcon />} imagePreview={imageSlots.background} onImageUpload={(base64) => handleImageUpload('background', base64)} />
            <ImageUploader label="Object" icon={<CubeIcon />} imagePreview={imageSlots.object} onImageUpload={(base64) => handleImageUpload('object', base64)} />
            <ImageUploader label="Accessory" icon={<CameraIcon />} imagePreview={imageSlots.accessory} onImageUpload={(base64) => handleImageUpload('accessory', base64)} />
          </div>

          <div>
            <label className="block text-md font-semibold text-text-primary mb-2">Describe what you'd like to create</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A woman sitting on a vintage chair in a futuristic city, holding a glowing orb."
              className="w-full p-3 bg-white border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-brand-primary transition-shadow"
              rows={4}
            />
          </div>

          <div>
            <h3 className="text-md font-semibold text-text-primary mb-2">Styles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {styleOptions.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyle(style.name)}
                  className={`group space-y-2 text-center rounded-lg transition-all p-1 border-2 ${selectedStyle === style.name ? 'border-brand-primary' : 'border-transparent'}`}
                >
                  <img src={style.preview} alt={style.name} className="w-full h-20 object-cover rounded-md group-hover:opacity-90" />
                  <span className={`text-sm font-medium ${selectedStyle === style.name ? 'text-brand-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{style.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
              <h3 className="text-md font-semibold text-text-primary mb-2">Aspect Ratio</h3>
              <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setAspectRatio('1:1')} className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg h-20 transition-colors ${aspectRatio === '1:1' ? 'border-brand-primary text-brand-primary' : 'border-base-300 text-text-secondary hover:border-slate-400'}`}>
                      <AspectRatioSquareIcon className="w-8 h-8"/>
                      <span className="text-sm mt-1">Square</span>
                  </button>
                   <button onClick={() => setAspectRatio('16:9')} className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg h-20 transition-colors ${aspectRatio === '16:9' ? 'border-brand-primary text-brand-primary' : 'border-base-300 text-text-secondary hover:border-slate-400'}`}>
                      <AspectRatioLandscapeIcon className="w-8 h-8"/>
                       <span className="text-sm mt-1">Landscape</span>
                  </button>
                   <button onClick={() => setAspectRatio('9:16')} className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg h-20 transition-colors ${aspectRatio === '9:16' ? 'border-brand-primary text-brand-primary' : 'border-base-300 text-text-secondary hover:border-slate-400'}`}>
                      <AspectRatioPortraitIcon className="w-8 h-8"/>
                       <span className="text-sm mt-1">Portrait</span>
                  </button>
              </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={!canGenerate || isLoading}
            className="w-full mt-4 py-3 px-4 flex items-center justify-center gap-2 font-semibold text-white bg-brand-primary rounded-lg transition-all hover:bg-brand-secondary disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-100">
           <GeneratedImage 
             creation={currentCreation}
             isLoading={isLoading} 
             aspectRatio={aspectRatio}
             onDelete={handleDeleteImage}
           />
        </main>
      </div>
    </div>
  );
};

export default App;
