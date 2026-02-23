import express from "express";
const app = express();
import env from "./utils/envalid";
import logger from "./middlewares/logger";
import postRouter from "./routers/post";
import authRouter from "./routers/auth";
import userRouter from "./routers/user";
import searchRouter from "./routers/search";
import uploadRouter from "./routers/upload";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/user";
const server = createServer(app);

const isProd = !env.DEV;
if (isProd) {
  app.use(logger);
}

// CORS configuration to handle multiple origins
const allowedOrigins = env.CLIENT_URL.split(',').map(url => url.trim());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const ONLINE_USER_TO_SOCKET_ID_MAP = new Map<string, string>();

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL.split(',').map(url => url.trim()),
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("a user connected with id : ", socket.id);
  
  socket.on("start", ({ userId }) => {
    ONLINE_USER_TO_SOCKET_ID_MAP.set(userId, socket.id);
  });
  
  socket.on("notify", ({ userId }) => {
    const room = ONLINE_USER_TO_SOCKET_ID_MAP.get(userId);
    if (room) {
      socket.to(room).emit("haveNotifications", true);
    }
  });
  
  socket.on("checkNotifications", async ({ userId }) => {
    const test = await User.findOne({
      _id: userId,
    });
    let count = 0;
    test?.notifications.forEach((item) => {
      if (!item.read) count++;
    });
    socket.emit("notificationsCount", { count });
  });
  
  socket.on("readAll", async ({ userId }) => {
    await User.updateOne(
      { _id: userId },
      { $set: { "notifications.$[].read": true } },
      { multi: true }
    );
  });
  
  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
    // Clean up the map to prevent memory leaks
    for (const [userId, socketId] of ONLINE_USER_TO_SOCKET_ID_MAP.entries()) {
      if (socketId === socket.id) {
        ONLINE_USER_TO_SOCKET_ID_MAP.delete(userId);
        break;
      }
    }
  });
});

app.get("/test", (req, res) => {
  res.send("Hello from server side");
});

app.use("/post", postRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/search", searchRouter);
app.use("/upload", uploadRouter);

app.use(errorHandler);

export { server };
