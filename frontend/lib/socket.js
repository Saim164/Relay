import { io } from "socket.io-client";
import { API_ORIGIN, apiRequest } from "./api.js";

export const SOCKET_EVENTS = {
  NEW_MESSAGE: "message:new",
};

const SOCKET_URL = API_ORIGIN || process.env.SOCKET_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (sendAuth) => {
    apiRequest("/users/socket-token")
      .then(({ token }) => sendAuth({ token }))
      .catch(() => sendAuth({}));
  },
});
