"use client";
import { useState, useEffect, useRef } from "react";

export default function VideoPreview({
  videoSrc,
  className,
}: {
  videoSrc: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState("/avatar_IA/video_IA/videoIA.mp4");
  const [isMuted, setIsMuted] = useState(true);
  const [userTriedPlay, setUserTriedPlay] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);
  const [error, setError] = useState(false);
  const [fade, setFade] = useState(false); // For fade effect
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackVideo = "/avatar_IA/video_IA/videoIA.mp4";

  // Handle video switching with fade effect
  useEffect(() => {
    if (
      (videoSrc && videoSrc !== fallbackVideo && currentSrc !== videoSrc) ||
      ((!videoSrc || videoSrc === fallbackVideo) && currentSrc !== fallbackVideo)
    ) {
      setFade(true); // Start fade out
      setTimeout(() => {
        if (videoSrc && videoSrc !== fallbackVideo) {
          setCurrentSrc(videoSrc);
          setIsMuted(false);
        } else {
          setCurrentSrc(fallbackVideo);
          setIsMuted(true);
        }
        setUserTriedPlay(false);
        setNeedsUserPlay(false);
        setError(false);
        setFade(false); // Fade in
      }, 300); // Fade duration (ms)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc]);

  // Play video when src or mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.load();
      videoRef.current.play().catch(() => setNeedsUserPlay(true));
    }
  }, [currentSrc, isMuted]);

  const handleLoadedData = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setNeedsUserPlay(true));
      }
    }
  };

  const handleEnded = () => {
    if (currentSrc !== fallbackVideo) {
      setFade(true);
      setTimeout(() => {
        setCurrentSrc(fallbackVideo);
        setIsMuted(true);
        setUserTriedPlay(false);
        setNeedsUserPlay(false);
        setFade(false);
      }, 300);
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-black rounded-xl relative ${className || ""}`}
      style={{ overflow: "hidden" }}
    >
      <video
        key={currentSrc + String(userTriedPlay)}
        ref={videoRef}
        src={currentSrc}
        controls={false}
        autoPlay
        muted={isMuted}
        className={`rounded-xl w-full h-full object-cover border-4 border-white bg-black video-fade ${fade ? "fade-out" : "fade-in"}`}
        style={{ background: "#222" }}
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        onError={() => setError(true)}
        onPlay={() => setNeedsUserPlay(false)}
      />
      {needsUserPlay && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-lg rounded-xl z-10"
          onClick={async () => {
            setUserTriedPlay(true);
            if (videoRef.current) {
              videoRef.current.muted = isMuted;
              await new Promise((res) => setTimeout(res, 0));
              videoRef.current.play().catch(() => setNeedsUserPlay(true));
            }
          }}
        >
          Reproducir video
        </button>
      )}
      {error && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
          <span>Error cargando video.</span>
        </div>
      )}
      <style jsx global>{`
        .video-fade {
          transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1),
            transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in {
          opacity: 1;
          transform: scale(1);
        }
        .fade-out {
          opacity: 0;
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
