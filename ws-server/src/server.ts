import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import cors from "cors";

dotenv.config();
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const clients = new Map<string, WebSocket>(); // Peer 정보 저장

const enum MsgType{
  JOIN = "join",
  GET_USERS = "get_users",
  OFFER = "offer",
  ANSWER = "answer",
  CANDIDATE = "candidate"
}

interface Message {
  type: MsgType;
  userId: string;
  target: string;
}

wss.on("connection", (ws: WebSocket) => {
  let userId: string | null = null;
  console.log("✅ 클라이언트 연결됨");

  ws.on("message", (message: RawData) => {
    const data: Message = JSON.parse(message.toString());
    if(data === null || data === undefined) {
      console.log("⚠️ 메시지가 없습니다.");
      return;
    }
    if(data.type === undefined || data.type === null) {
      console.log("⚠️ 메시지 타입이 없습니다.");
      return;
    }
    switch (data.type) {
      case MsgType.JOIN:
        userId = data.userId;
        if (userId === null || userId === undefined)
          break;
        clients.set(userId, ws);
        console.log(`👤 사용자 ${userId} 참여`);
        break;
      case MsgType.GET_USERS:
        // ✅ 현재 접속한 사용자 중 자신을 제외한 사용자 랜덤 선택
        const availableUsers = [...clients.keys()].filter((id) => id !== userId);
        if (availableUsers.length > 0) {
          const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
          console.log(`👤 상대 사용자 ${randomUser} 전달`);
          ws.send(JSON.stringify({ type: "set_remote_user", remoteUserId: randomUser }));
        }
        break;

      case MsgType.OFFER:
      case MsgType.ANSWER:
      case MsgType.CANDIDATE:
        const targetWs = clients.get(data.target);
        if (targetWs) {
          targetWs.send(JSON.stringify(data));
        }
        break;

      default:
        console.log("⚠️ 알 수 없는 메시지 타입:", data.type);
    }
  });

  ws.on("close", () => {
    if (userId) {
      clients.delete(userId);
      console.log(`❌ 사용자 ${userId} 연결 해제`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Signaling Server running on port ${PORT}`));
