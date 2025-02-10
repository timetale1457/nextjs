import { useEffect, useState } from "react";

const SIGNALING_SERVER_URL = "ws://localhost:5000";

export default function useSignaling(userId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket(SIGNALING_SERVER_URL);

    socket.onopen = () => {
      console.log("✅ Signaling 서버에 연결됨");
      socket.send(JSON.stringify({ type: "join", userId }));
    };

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("📥 메시지 수신:", data);
      if (data.type === "set_remote_user") {
        console.log(`🔗 상대방 ID 설정됨: ${data.remoteUserId}`);
        setRemoteUserId(data.remoteUserId);
      }
    };

    setWs(socket);
    return () => socket.close();
  }, [userId]);

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("📤 메시지 전송:", message);
      ws.send(JSON.stringify(message));
    }
  };

  return { sendMessage, remoteUserId };
}