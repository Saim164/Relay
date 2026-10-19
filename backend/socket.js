const { Server } = require("socket.io");
const { parseCookie } = require("cookie");
const { getUserFromToken } = require("./services/authService.js");

let io = null;

const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookie(socket.handshake.headers.cookie || "");
      const user = await getUserFromToken(cookies.token);
      if (!user) {
        return next(new Error("Authentication required"));
      }

      socket.data.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.user._id}`);
  });
};

const notifyUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

module.exports = { initSocket, notifyUser };
