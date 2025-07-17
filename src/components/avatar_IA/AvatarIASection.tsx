"use client";
import { useState, useEffect } from "react";
import UserCamera from "./UserCamera";
import VideoPreview from "./VideoPreview";
import AudioRecorder from "./AudioRecorder";
import StatusAlert from "./StatusAlert";
import { useRouter } from "next/navigation";
// import MicrophoneTestBar from "./MicrophoneTestBar";

// Componente principal de la sección Avatar IA
export default function AvatarIASection() {
  const [status, setStatus] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // Guarda el video generado
  // Log para depuración
  const handleSetVideoUrl = (url: string) => {
    console.log("Nuevo videoUrl:", url);
    setVideoUrl(url);
  };
  const router = useRouter();

  // Solicita permisos de cámara y micrófono al ingresar
  useEffect(() => {
    async function requestPermissions() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissionsGranted(true);
      } catch {
        setStatus(
          "Debes permitir acceso a cámara y micrófono para usar esta función."
        );
      }
    }
    requestPermissions();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center w-full h-full bg-black overflow-hidden">
      {status && <StatusAlert message={status} />}
      <button
        className="absolute top-6 left-6 px-6 py-3 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition text-lg z-20"
        onClick={() => router.replace("/services")}
      >
        ← Regresar
      </button>
      {/* Barra de prueba de micrófono a la derecha, alineada con el botón regresar */}
      {/* <div className="absolute top-6 right-6 z-20">
        <MicrophoneTestBar />
      </div> */}
      <div className="flex w-full max-w-8xl h-[105vh] gap-2 items-center justify-center px-8 pt-25 pb-0.5">
        <div className="flex-1 flex items-start justify-center h-full">
          {permissionsGranted ? (
            <UserCamera
              disabled={false}
              className="border-4 border-white rounded-xl bg-black w-full h-full max-w-[900px] max-h-[80vh]"
            />
          ) : (
            <div className="text-white text-lg">Esperando permisos...</div>
          )}
        </div>
        <div className="flex-1 flex items-start justify-center h-full">
          {/* Muestra el video generado por la IA si existe, si no muestra fallback */}
          <VideoPreview
            videoSrc={videoUrl || "/avatar_IA/video_IA/videoIA.mp4"}
            className="border-4 border-white rounded-xl bg-black w-full h-full max-w-[900px] max-h-[80vh]"
          />
        </div>
      </div>
      {/* Botón de micrófono centrado abajo, usando AudioRecorder */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <AudioRecorder onVideoReady={handleSetVideoUrl} />
      </div>
    </div>
  );
}
