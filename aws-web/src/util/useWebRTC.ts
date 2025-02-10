import { useEffect, useRef, useState } from "react";
import useSignaling from "./useSignaling";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}; // Google STUN 서버 사용

export default function useWebRTC(userId: string, remoteUserId: string) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { sendMessage } = useSignaling(userId);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({ type: "candidate", target: remoteUserId, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return () => {
      peerConnection.current?.close();
    };
  }, [remoteUserId, sendMessage]);

  const createOffer = async () => {
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    sendMessage({ type: "offer", target: remoteUserId, offer });
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    sendMessage({ type: "answer", target: remoteUserId, answer });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  return { createOffer, createAnswer, handleAnswer, handleCandidate, remoteStream };
}
