import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("token");
    // Connect to current origin in dev/prod, vite proxies /socket.io to backend
    socket = io(window.location.origin, {
      auth: {
        token: token ?? "",
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected, id:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection error:", err.message);
    });
  }

  return socket;
}

export function joinContest(contestId: string) {
  const s = getSocket();
  s.emit("join:contest", contestId);
}

export function leaveContest(contestId: string) {
  const s = getSocket();
  s.emit("leave:contest", contestId);
}

export function joinUser(userId: string) {
  const s = getSocket();
  s.emit("join:user", userId);
}
