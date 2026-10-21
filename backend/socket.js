const { Server } = require("socket.io");
const { getUserFromSocketToken } = require("./services/authService.js");

const SOCKET_EVENTS = {
    NEW_MESSAGE: "message:new",
};

const userRoom = (userId) => `user:${userId}`;

let io = null;

const initSocket = (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {
        cors: { origin: allowedOrigins },
    });

    // The client sends a short-lived ticket from GET /users/socket-token; no ticket, no connection.
    io.use(async (socket, next) => {
        try {
            const user = await getUserFromSocketToken(socket.handshake.auth?.token);
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
        socket.join(userRoom(socket.data.user._id));
    });
};

const notifyUser = (userId, event, data) => {
    if (!io) return;
    io.to(userRoom(userId)).emit(event, data);
};

module.exports = { SOCKET_EVENTS, initSocket, notifyUser };
