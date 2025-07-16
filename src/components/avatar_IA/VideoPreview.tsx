"use client";
import { useState, useEffect, useRef } from "react";

export default function VideoPreview({
  videoSrc,
  showFallback,
  className,
}: {
  videoSrc: string;
  showFallback?: boolean;
  className?: string;
}) {
  // Estado para saber si el video cargó
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  // Estado para saber si el video está pausado por restricción de autoplay
  const [needsUserPlay, setNeedsUserPlay] = useState(false);
  // Referencia al video
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Forzar recarga y reproducción del video cuando cambia videoSrc
  useEffect(() => {
    setLoaded(false);
    setError(false);
    if (videoRef.current) {
      videoRef.current.load();
      // Intentar reproducir el video automáticamente
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("No se pudo reproducir el video automáticamente:", err);
        });
      }
    }
  }, [videoSrc]);

  const START_AT = 3;
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // Si el video ya está listo, setea el tiempo
    if (video.readyState >= 2) {
      video.currentTime = START_AT;
    } else {
      // Si no, espera al siguiente evento 'canplay'
      const setTime = () => {
        video.currentTime = START_AT;
        video.removeEventListener("canplay", setTime);
      };
      video.addEventListener("canplay", setTime);
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-black rounded-xl relative ${
        className || ""
      }`}
    >
      {videoSrc ? (
        <>
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            controls={false}
            autoPlay
            className="rounded-xl w-full h-full object-cover border-4 border-white bg-black"
            style={{ background: "#222" }}
            onLoadedData={() => {
              setLoaded(true);
              setError(false);
              setNeedsUserPlay(false);
              console.log("Video loaded:", videoSrc);
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }}
            onError={(e) => {
              setLoaded(false);
              setError(true);
              console.error("Error cargando video:", videoSrc, e);
            }}
            onPlay={() => setNeedsUserPlay(false)}
            onPause={() => {
              // Si el video está al principio y no se ha reproducido, probablemente es por restricción de autoplay
              if (
                videoRef.current &&
                videoRef.current.currentTime < 0.5 &&
                !videoRef.current.ended
              ) {
                setNeedsUserPlay(true);
              }
            }}
          />
          {needsUserPlay && (
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-lg rounded-xl z-10"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play();
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
        </>
      ) : null}
      {showFallback && (!loaded || !videoSrc) && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg bg-black bg-opacity-60 rounded-xl">
          Cargando video IA...
        </div>
      )}
    </div>
  );
}
