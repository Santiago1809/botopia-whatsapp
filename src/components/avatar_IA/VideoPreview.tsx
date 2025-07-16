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
  // Estado para saber si el usuario ya intentó reproducir manualmente
  const [userTriedPlay, setUserTriedPlay] = useState(false);
  // Referencia al video
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Forzar recarga y reproducción del video cuando cambia videoSrc
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setNeedsUserPlay(false);
    setUserTriedPlay(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.load();
      console.log("[VideoPreview] useEffect: videoRef", videoRef.current);
    }
  }, [videoSrc]);

  // Intenta reproducir el video cuando se carga
  const handleLoadedData = () => {
    setLoaded(true);
    setError(false);
    if (videoRef.current) {
      console.log(
        "[VideoPreview] handleLoadedData: intentando play()",
        videoRef.current
      );
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          setNeedsUserPlay(true);
          console.warn(
            "[VideoPreview] No se pudo reproducir el video automáticamente:",
            err
          );
        });
      }
    }
    console.log("[VideoPreview] Video loaded:", videoSrc);
  };

  const START_AT = 3;
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.log("[VideoPreview] handleLoadedMetadata", video);
    // Si el video ya está listo, setea el tiempo
    if (video.readyState >= 2) {
      video.currentTime = START_AT;
      console.log("[VideoPreview] currentTime seteado a", START_AT);
    } else {
      // Si no, espera al siguiente evento 'canplay'
      const setTime = () => {
        video.currentTime = START_AT;
        video.removeEventListener("canplay", setTime);
        console.log(
          "[VideoPreview] currentTime seteado a",
          START_AT,
          "(canplay)"
        );
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
            key={videoSrc + String(userTriedPlay)}
            ref={videoRef}
            src={videoSrc}
            controls={true}
            autoPlay
            muted
            className="rounded-xl w-full h-full object-cover border-4 border-white bg-black"
            style={{ background: "#222" }}
            onLoadedData={handleLoadedData}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.pause();
                console.log("[VideoPreview] onEnded: video pausado");
              }
            }}
            onError={(e) => {
              setLoaded(false);
              setError(true);
              console.error(
                "[VideoPreview] Error cargando video:",
                videoSrc,
                e
              );
            }}
            onPlay={() => {
              setNeedsUserPlay(false);
              console.log("[VideoPreview] onPlay");
            }}
          />
          {needsUserPlay && (
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-lg rounded-xl z-10"
              onClick={async () => {
                setUserTriedPlay(true);
                if (videoRef.current) {
                  videoRef.current.muted = false;
                  console.log(
                    "[VideoPreview] Botón: muted=false, intentando play()"
                  );
                  await new Promise((res) => setTimeout(res, 0));
                  videoRef.current
                    .play()
                    .then(() => {
                      console.log("[VideoPreview] Botón: play() exitoso");
                    })
                    .catch((err) => {
                      console.error("[VideoPreview] Botón: play() falló", err);
                    });
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
