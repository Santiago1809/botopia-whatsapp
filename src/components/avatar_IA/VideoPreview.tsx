"use client";
import { useState, useEffect } from "react";

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
  // Forzar recarga del video cuando cambia videoSrc
  useEffect(() => {
    setLoaded(false);
    setError(false);
    if (videoSrc) {
      console.log("VideoPreview render videoSrc:", videoSrc);
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
            src={videoSrc}
            controls={false}
            autoPlay
            loop
            className="rounded-xl w-full h-full object-cover border-4 border-white bg-black"
            style={{ background: "#222" }}
            onLoadedData={() => {
              setLoaded(true);
              setError(false);
              console.log("Video loaded:", videoSrc);
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              setLoaded(false);
              setError(true);
              console.error("Error cargando video:", videoSrc, e);
            }}
            onEnded={(e) => {
              // Reinicia el video sin pantallazo negro
              const video = e.currentTarget;
              video.currentTime = START_AT;
              video.play();
              video.style.opacity = "1";
            }}
          />
          {/* Link de depuración para abrir el video actual */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
            <a
              href={videoSrc}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4af" }}
            >
              Abrir este video en otra pestaña (debug)
            </a>
          </div>
          {error && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
              <span>Error cargando video. </span>
              <a
                href={videoSrc}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4af" }}
              >
                Abrir video en otra pestaña (debug)
              </a>
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
