import React, { useState, useEffect } from 'react';

const VideoPlayer = ({
  currentLesson,
  aiVideoUrl,
  selectedCelebrity,
  celebrityVideoMap,
  activeCaption,
  playerContainerRef,
  videoRef,
  handleProgress,
  getYouTubeVideoId
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading effect
  };

  useEffect(() => {
    const videoElement = videoRef?.current;
    if (videoElement) {
      videoElement.addEventListener('play', handlePlayStart);
      return () => {
        videoElement.removeEventListener('play', handlePlayStart);
      };
    }
  }, [videoRef]);
  return (
    <div className="xl:col-span-2">
      <div
        ref={playerContainerRef}
        className="relative bg-black rounded-lg overflow-hidden group"
        style={{ aspectRatio: "16/9" }}
      >
        {/* ===== KEEP YOUR EXISTING VIDEO / IFRAME CODE INSIDE ===== */}

        {currentLesson?.youtubeUrl ? (
          <iframe
            key={currentLesson.id}
            src={`https://www.youtube.com/embed/${getYouTubeVideoId(
              currentLesson.youtubeUrl
            )}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentLesson.title}
          />
        ) : (
          <video
            ref={videoRef}
            src={
              aiVideoUrl ||
              (selectedCelebrity &&
                celebrityVideoMap[selectedCelebrity]?.video) ||
              currentLesson?.videoUrl
            }
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={handleProgress}
            onLoadedMetadata={handleProgress}
            controls={false}
            playsInline
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white mt-2 text-sm">Loading video...`</p>
            </div>
          </div>
        )}

        {/* Caption Overlay */}
        {activeCaption && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md text-sm">
            {activeCaption}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;