const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket){
    socket.on("newuser", function(username){
        socket.broadcast.emit("update", username + " joined the conversation");
    });
    
    socket.on("exituser", function(username){
        socket.broadcast.emit("update", username + " left the conversation");
    });
    
    socket.on("chat", function(message){
        socket.broadcast.emit("chat", message);
    });

    socket.on("typing", function(data){
        socket.broadcast.emit("typing", data);
    });

    socket.on("stoptyping", function(){
        socket.broadcast.emit("stoptyping");
    });
});

server.listen(5000, function(){
    console.log("Server is listening on port 5000");
});
