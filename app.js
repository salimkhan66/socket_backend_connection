const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const cors = require('cors');

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Yahan apne frontend ka URL daalna hai
  }
});


// Express route
app.get("/", (req, res) => {
  res.send("Hello from Express");
});


const userMap=new Map();
// Socket.IO connection
io.on("connection", (socket) => {
    // Add user to userMap
        // console.log(`User connected: ${socket.id}`);
    userMap.set(socket.handshake.query.id, socket.id);
  //send msg
  socket.on("private_message", (msg) => {
    console.log(msg)

    const recipientSocketId = userMap.get(msg.toUserId); // Get recipient's socket ID
    if (recipientSocketId) {
      // Send the message to the recipient
      socket.to(recipientSocketId).emit("rcv_message", {
        fromUserId: socket.handshake.query.id,
        message: msg.msg,
      });
 
    } else {
      console.log(`User with ID ${msg.toUserId} not found`);
    }
         

   
});

socket.on("group_message", (msg) => {

  const groupSocketId = msg.toUserId.map((item)=>{
    return userMap.get(item);
  }); 

  groupSocketId.forEach((item) => {
    // Send the message to the recipient
    if (item) {
      socket.to(item).emit("rcv_message", {
        fromUserId: socket.handshake.query.id,
        message: msg.msg,
      });
    }
  }); 
 
  

}
)
  // Handle socket events
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

});

// Server listen
server.listen(8080, () => {
  console.log("Server running on port 8080");
});
