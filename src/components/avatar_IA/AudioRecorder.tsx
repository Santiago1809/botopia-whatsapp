"use client";
import { useRef, useState, useEffect } from "react";

export default function AudioRecorder({
  onVideoReady,
}: {
  onVideoReady: (videoUrl: string) => void;
}) {
  // Refs para grabación WebAudio (deben ir dentro del componente)
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef<number>(44100);
  const hasProcessedRef = useRef(false);

  // Log de montaje del componente
  useEffect(() => {
    console.log("AudioRecorder montado");
  }, []);
  // Estados para controlar la grabación, procesamiento y mensajes descriptivos
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false); // Nuevo estado para feedback visual
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);
  const silenceDetected = useRef(false);

  // Debug state for live amplitude and voice detection
  const [debugInfo, setDebugInfo] = useState<{
    min: number;
    max: number;
    isVoice: boolean;
    threshold: number;
    voiceDuration: number;
  }>({ min: 128, max: 128, isVoice: false, threshold: 4, voiceDuration: 0 });

  // Obtiene el stream global del micrófono, permitiendo seleccionar dispositivo si hay varios
  const getAudioStreams = async (): Promise<{
    recordStream: MediaStream | null;
    analyzeStream: MediaStream | null;
  }> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      let constraints: MediaStreamConstraints = { audio: true };
      if (audioInputs.length > 1) {
        // Si hay más de un micrófono, intenta usar el predeterminado
        const defaultDevice =
          audioInputs.find((d) => d.deviceId === "default") || audioInputs[0];
        constraints = { audio: { deviceId: defaultDevice.deviceId } };
      }
      // Solicita dos streams independientes
      const recordStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      const analyzeStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      return { recordStream, analyzeStream };
    } catch (e) {
      console.error("getAudioStreams: error al obtener streams", e);
      setMessage(
        "No se detectó un micrófono funcional o no se otorgaron permisos."
      );
      return { recordStream: null, analyzeStream: null };
    }
  };

  // Solicita permisos de micrófono si no están dados o si el stream falla
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("requestMicrophonePermission: permiso concedido");
      return true;
    } catch (e) {
      console.error("requestMicrophonePermission: permiso denegado", e);
      setMessage(
        "Debes permitir acceso al micrófono para grabar audio. ¿Quieres intentarlo de nuevo?"
      );
      return false;
    }
  };

  // Inicia la grabación de audio usando WebAudio API
  const startRecording = async () => {
    console.log("Botón de grabar presionado");
    if (isProcessing) {
      setMessage("Espere, se está procesando un audio anterior...");
      return;
    }
    if (isRecording) {
      setMessage("Ya hay una grabación en curso.");
      return;
    }
    hasProcessedRef.current = false;
    setMessage("Verificando micrófono...");
    silenceDetected.current = false;
    setDebugInfo({
      min: 128,
      max: 128,
      isVoice: false,
      threshold: 4,
      voiceDuration: 0,
    });
    const permission = await requestMicrophonePermission();
    if (!permission) {
      setMessage("Permiso de micrófono denegado");
      return;
    }
    // Obtén dos streams independientes
    const { recordStream, analyzeStream } = await getAudioStreams();
    if (!recordStream || !analyzeStream) {
      setMessage("No se pudo acceder al micrófono");
      return;
    }
    // WebAudio API setup
    const AudioCtx =
      window.AudioContext ||
      (
        window as unknown as Window & {
          webkitAudioContext: typeof AudioContext;
        }
      ).webkitAudioContext;
    const audioContext = new AudioCtx();
    audioContextRef.current = audioContext;
    sampleRateRef.current = audioContext.sampleRate;
    const input = audioContext.createMediaStreamSource(recordStream);
    audioInputRef.current = input;
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current = processor;
    audioBuffersRef.current = [];
    processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      audioBuffersRef.current.push(new Float32Array(data));
    };
    input.connect(processor);
    processor.connect(audioContext.destination);
    setIsRecording(true);
    setMicActive(true); // Mostrar feedback visual
    setMessage("Grabando... (se detendrá si no detecta sonido en 5 segundos)");
    // Detecta silencio usando el stream de análisis
    detectSilence(analyzeStream, () => {
      console.log("detectSilence: silencio detectado, deteniendo grabación");
      silenceDetected.current = true;
      stopRecording(true);
      analyzeStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
          console.log("analyzeStream: track detenido tras silencio", track);
        }
      });
    });
  };

  // Detiene la grabación y procesa el audio
  const stopRecording = (auto = false) => {
    console.log("stopRecording: llamada (WebAudio)", { auto, isRecording });
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    setIsRecording(false);
    setMicActive(false); // Ocultar feedback visual
    setMessage(auto ? "Procesando audio..." : "Procesando audio...");
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
    }
    if (audioInputRef.current) audioInputRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    // Procesa el buffer grabado
    processAudio(audioBuffersRef.current, sampleRateRef.current);
    audioBuffersRef.current = [];
  };

  // Detecta silencio en el stream de audio (robusto y compatible)
  const detectSilence = (stream: MediaStream, onSilence: () => void) => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AC();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 2048;
    const data = new Uint8Array(analyser.fftSize);
    const silenceStart = Date.now();
    let lastVoice = Date.now();
    let voiceDetected = false;
    let voiceDuration = 0;
    const threshold = 4; // Más permisivo (antes era 6)
    const minVoiceMs = 400; // Debe haber voz al menos 400ms para aceptar
    const checkSilence = () => {
      analyser.getByteTimeDomainData(data);
      const max = Math.max(...data);
      const min = Math.min(...data);
      const amplitude = max - min;
      // Heurística simple: voz si la amplitud supera el umbral y hay suficiente variación
      const isVoice = amplitude >= threshold;
      if (isVoice) {
        if (!voiceDetected) voiceDetected = true;
        lastVoice = Date.now();
        voiceDuration += 200;
      }
      setDebugInfo({ min, max, isVoice, threshold, voiceDuration });
      // Si nunca hubo voz en 5s, muestra mensaje y detiene
      if (!voiceDetected && Date.now() - silenceStart > 5000) {
        console.log("detectSilence: no se detectó voz en 5s");
        audioCtx.close();
        setMessage(
          "No se detectó ningún sonido. Intenta hablar o revisa tu micrófono."
        );
        setIsRecording(false);
        onSilence();
        return;
      }
      // Si hubo voz pero luego silencio por 5s, detiene
      if (voiceDetected && Date.now() - lastVoice > 5000) {
        console.log("detectSilence: hubo voz pero luego silencio 5s");
        audioCtx.close();
        setMessage("No se detectó voz durante 5 segundos. Procesando audio...");
        onSilence();
        return;
      }
      // Si la voz total fue muy breve (< minVoiceMs), lo considera ruido
      if (
        voiceDetected &&
        voiceDuration < minVoiceMs &&
        Date.now() - silenceStart > 5000
      ) {
        console.log("detectSilence: voz insuficiente, considerado ruido");
        audioCtx.close();
        setMessage("No se detectó voz suficiente. Intenta hablar claramente.");
        setIsRecording(false);
        onSilence();
        return;
      }
      silenceTimeout.current = setTimeout(checkSilence, 200);
    };
    checkSilence();
  };

  // Sube el audio a Cloudinary y retorna el link público usando solo las variables NEXT_PUBLIC_ del .env.local
  const uploadToCloudinary = async (audioBlob: Blob): Promise<string> => {
    // Log de las variables y del FormData
    console.log("Cloudinary envs:", {
      preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
      folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!
    );
    formData.append("folder", process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER!);
    // Log del contenido real del FormData
    for (const pair of formData.entries()) {
      if (typeof pair[1] === "object" && pair[1] && "size" in pair[1]) {
        // Es un Blob
        console.log(
          "FormData:",
          pair[0],
          `Blob(${(pair[1] as Blob).size} bytes)`
        );
      } else {
        console.log("FormData:", pair[0], pair[1]);
      }
    }
    console.log("Subiendo audio a Cloudinary...");
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.secure_url) {
      console.error("[Cloudinary Error] POST response:", data);
      throw new Error(
        "No se pudo subir el audio: " +
          (data.error?.message || JSON.stringify(data))
      );
    }
    return data.secure_url;
  };

  // Modifica processAudio para recibir los buffers y sampleRate
  const processAudio = async (buffers: Float32Array[], sampleRate: number) => {
    console.log(
      "[DEBUG] processAudio called. Buffers length:",
      buffers.length,
      "Sample rate:",
      sampleRate
    );
    if (!buffers || buffers.length === 0) {
      setMessage("No se detectó audio grabado. Intenta nuevamente.");
      console.warn("[DEBUG] processAudio: No audio buffers recorded.");
      return;
    }
    setIsProcessing(true);
    setMessage("Subiendo audio a Cloudinary...");
    try {
      const audioBlob = encodeWAV(buffers, sampleRate);
      console.log("[DEBUG] WAV Blob size:", audioBlob.size);
      const audioUrl = await uploadToCloudinary(audioBlob);
      console.log("[DEBUG] Cloudinary audioUrl:", audioUrl);
      setMessage("Audio subido. Procesando conversación...");
      // Envía el link al microservicio WAV2LIP_MICRO
      const response = await fetch("http://18.116.242.235:8081/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl }),
      });
      const result = await response.json();
      // Debug: log the full response
      console.log("[DEBUG] WAV2LIP_MICRO response:", result);
      if (response.ok && result.success) {
        if (result.data && result.data.videoUrl) {
          console.log(
            "AudioRecorder: videoUrl recibido del microservicio:",
            result.data.videoUrl
          );
          onVideoReady(result.data.videoUrl + "?t=" + Date.now()); // Fuerza recarga
          setMessage("¡Conversación procesada exitosamente!");
          setTimeout(() => setMessage(null), 2000);
        } else {
          setMessage(
            "La conversación fue procesada pero no se recibió un video. Intenta de nuevo o revisa el audio grabado."
          );
          setTimeout(() => setMessage(null), 2000);
        }
      } else {
        setMessage(
          `Error al procesar la conversación: ${
            result.error || JSON.stringify(result)
          }`
        );
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (err) {
      setMessage(
        "Error al subir o procesar el audio: " + (err as Error).message
      );
      console.error("[DEBUG] processAudio error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Utilidad para convertir Float32Array a WAV Blob
  function encodeWAV(buffers: Float32Array[], sampleRate: number): Blob {
    const numChannels = 1;
    const length = buffers.reduce((acc, b) => acc + b.length, 0);
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    // RIFF identifier
    [0x52, 0x49, 0x46, 0x46].forEach((b, i) => view.setUint8(i, b));
    view.setUint32(4, 36 + length * 2, true);
    [0x57, 0x41, 0x56, 0x45].forEach((b, i) => view.setUint8(8 + i, b));
    [0x66, 0x6d, 0x74, 0x20].forEach((b, i) => view.setUint8(12 + i, b));
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // bits per sample
    [0x64, 0x61, 0x74, 0x61].forEach((b, i) => view.setUint8(36 + i, b));
    view.setUint32(40, length * 2, true);
    // PCM samples
    let offset = 44;
    for (const buf of buffers) {
      for (let i = 0; i < buf.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, buf[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  // Permitir detener manualmente la grabación
  const handleMicButton = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording(false);
    } else {
      startRecording();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Mensaje descriptivo superior */}
      {message && (
        <div
          style={{
            marginBottom: 20,
            background: "#f0f0f0",
            padding: 10,
            borderRadius: 8,
            color: "#333",
            fontWeight: 500,
            maxWidth: 350,
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
      {/* Indicador visual de micrófono activo */}
      <div style={{ marginBottom: 10, height: 24 }}>
        {micActive && !isProcessing && (
          <span
            style={{
              color: "#ff5252",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              animation: "blink 1s steps(2, start) infinite",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#ff5252"
              style={{ marginRight: 4 }}
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
            Micrófono encendido
          </span>
        )}
      </div>
      {/* Debug bar: solo visible durante la grabación */}
      {isRecording && (
        <div
          style={{
            marginBottom: 10,
            width: 320,
            background: "#222",
            borderRadius: 6,
            padding: 8,
            color: "#fff",
            fontSize: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Min: {debugInfo.min}</span>
            <span>Max: {debugInfo.max}</span>
            <span>Δ: {debugInfo.max - debugInfo.min}</span>
            <span>Umbral: {debugInfo.threshold}</span>
          </div>
          <div style={{ width: "100%", marginTop: 6 }}>
            <div
              style={{
                height: 10,
                width: `${Math.min(100, (debugInfo.max - debugInfo.min) * 2)}%`,
                background: debugInfo.isVoice ? "#4caf50" : "#f44336",
                borderRadius: 4,
                transition: "width 0.2s, background 0.2s",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 4,
              color: debugInfo.isVoice ? "#4caf50" : "#f44336",
              fontWeight: 600,
            }}
          >
            {debugInfo.isVoice ? "Voz detectada" : "Sin voz"}
          </div>
        </div>
      )}
      {/* Botón de micrófono toggle */}
      <button
        onClick={handleMicButton}
        disabled={isProcessing}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: isRecording ? "#ff5252" : "#fff",
          color: isRecording ? "#fff" : "#2196f3",
          border: isRecording ? "2px solid #ff5252" : "none",
          fontSize: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          cursor: isProcessing ? "not-allowed" : "pointer",
          transition: "background 0.2s, opacity 0.2s, border 0.2s",
          outline: "none",
          opacity: isProcessing ? 0.5 : 1,
          pointerEvents: isProcessing ? "none" : "auto",
        }}
        aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
        tabIndex={isProcessing ? -1 : 0}
      >
        {isRecording ? (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="24" fill="#ff5252" />
            <rect x="18" y="18" width="12" height="12" rx="3" fill="#fff" />
          </svg>
        ) : (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="24" fill="#fff" />
            <rect
              x="18"
              y="12"
              width="12"
              height="24"
              rx="6"
              fill="#fff"
              stroke="#000"
              strokeWidth="2"
            />
            <rect
              x="21"
              y="32"
              width="6"
              height="8"
              rx="3"
              fill="#fff"
              stroke="#000"
              strokeWidth="2"
            />
            <rect x="22" y="36" width="4" height="4" rx="2" fill="#000" />
          </svg>
        )}
      </button>
      <style>{`
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
