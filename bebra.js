const { io } = require("socket.io-client");

const socket = io("http://localhost:5555");

socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
