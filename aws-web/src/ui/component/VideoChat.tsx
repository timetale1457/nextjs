"use client"

import { useEffect, useRef, useState } from "react";

const VideoChat = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // 📌 브라우저에서 사용자 미디어(카메라/마이크) 접근 요청
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="w-96 h-auto border border-gray-500" />
    </div>
  );
};

export default VideoChat;