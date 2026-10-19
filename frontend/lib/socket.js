import { io } from "socket.io-client";
import { API_ORIGIN, apiRequest } from "./api.js";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_ORIGIN || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (sendAuth) => {
    apiRequest("/users/socket-token")
      .then(({ token }) => sendAuth({ token }))
      .catch(() => sendAuth({}));
  },
});
