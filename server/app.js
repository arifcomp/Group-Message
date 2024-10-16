const express = require("express");
const port = 3001;
const cors = require("cors");
const { mongoUri } = require("./connection/config");
const { mongodbConnect } = require("./connection/mongoDb");
const userRouter = require("./routes/userRouter");
const socketIO = require("socket.io");
const http = require("http");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

mongodbConnect(mongoUri);

app.use("/", userRouter);

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("new_message", (name, id, text) => {
    io.emit("receive_message", name, id, text);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
