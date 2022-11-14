const express = require("express");
const cors = require("cors");
const userRouter = require("./src/routes/userRoutes");
const { Server } = require("socket.io");
const { createServer } = require("http");

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/user", userRouter);

const httpServer = createServer();

const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket.emit("hello", "world", (response) => {
    console.log(response); // "got it"
  });
  socket.on("disconnect", () => {
    console.log(123);
  });
  socket.disconnect();
});

httpServer.listen(5555);

app.listen(PORT, () =>
  console.log("🚀 Server ready at: http://localhost:8080")
);
