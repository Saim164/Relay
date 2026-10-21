import { io } from "socket.io-client";
import { apiRequest } from "./api.js";

export const SOCKET_EVENTS = {
  NEW_MESSAGE: "message:new",
};

export const socket = io(process.env.SOCKET_URL, {
  autoConnect: false,
  auth: (sendAuth) => {
    apiRequest("/users/socket-token")
      .then(({ token }) => sendAuth({ token }))
      .catch(() => sendAuth({}));
  },
});
