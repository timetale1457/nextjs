"use client";

import { useEffect, useRef, useState } from "react";
import useWebRTC from "../../util/useWebRTC";
import useSignaling from "../../util/useSignaling";


const userId = Math.random().toString(36).substring(7); // ✅ 사용자별 고유 ID 생성

const VideoChat = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { sendMessage, remoteUserId } = useSignaling(userId);
  const { createOffer, createAnswer, handleAnswer, handleCandidate, remoteStream } =
    useWebRTC(userId, remoteUserId);

  useEffect(() => {
    navigator
      .mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((error) => console.error("Error accessing media devices.", error));

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ✅ Signaling Server에서 상대방 ID 받아오기
  useEffect(() => {
    sendMessage({ type: "get_users" });
  }, [sendMessage]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="w-24 h-auto border border-gray-500" style={{width: "25%", height: "auto"}} />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-24 h-auto border border-blue-500" style={{width: "25%", height: "auto"}}/>

      {remoteUserId == "" ? (
        <button onClick={createOffer} className="p-2 m-2 bg-blue-500 text-white rounded">
          📞 Call {remoteUserId}
        </button>
      ) : (
        <p>🔍 상대방 찾는 중...</p>
      )}
    </div>
  );
};

export default VideoChat;