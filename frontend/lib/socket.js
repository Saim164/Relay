import { io } from "socket.io-client";
import { API_ORIGIN } from "./api.js";

export const socket = io(API_ORIGIN, {
  withCredentials: true,
  autoConnect: false,
});
