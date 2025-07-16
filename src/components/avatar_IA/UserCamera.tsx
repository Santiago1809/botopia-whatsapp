"use client";
import { useRef, useEffect } from "react";

export default function UserCamera({
  disabled,
  className,
}: {
  disabled: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (!disabled) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [disabled]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      className={`rounded-lg w-full h-full object-cover ${className || ""}`}
      style={{ background: "#222" }}
    />
  );
}
