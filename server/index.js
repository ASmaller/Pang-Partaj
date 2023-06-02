const express = require('Express');
const app = express();
const http = require('http');
const { emit } = require('process');
const server = http.createServer(app);
const port = 3000;
const { Server } = require("socket.io");  //Required for the websocket connections
const io = new Server(server);

let players = [];

app.use(express.static('./public'));

io.on('connection', (socket) => {
  console.log('A socket has been connected, ID: ' + socket.id);

  socket.on('joinRoom', (roomCode, username) => {
    console.log('\nA socket has joined a room.');
    console.log('Socket: ' + socket.id);
    console.log('Room code: ' + roomCode);
    players.push(socket); //Adds the socket to the list of players.
    socket.join(roomCode);  //Connects the socket to a room.
    socket.nickname = username;
    socket.roomCode = roomCode;

    console.log('\nA list of all socket id\'s currently connected to room ' + roomCode);
    players.forEach(player => {
      console.log(player.id);
      console.log(player.nickname + "\n");
    });
  });

  socket.on('buttonPressed', (playerName, buttonpresses) => {
    io.to(socket.roomCode).emit('scoreRecieved', playerName, buttonpresses);  //Sends an update to all sockets in a room when a player clicks their plunger in that room.

    console.log('\nSocket id: ' + socket.id);
    console.log('Socket score: ' + buttonpresses);
    players.forEach(player => { //Sorts and sends a "leaderboard" to a room when.
      if (player.id == socket.id) {
        player.score = buttonpresses;
        players.sort((a, b) => {
          return a.score - b.score;
        });
        io.to(socket.roomCode).emit('leaderBoard', players[(players.length-1)].nickname, players[(players.length-1)].score);  //Unnecessarily complicated way of sending the player with the highest score to the room their in.
      }
    });
  });

  socket.on('playerWon', (name) => {
    socket.broadcast.to(socket.roomCode).emit('playerHasWon');  //Socket broadcasts it's victory to all other sockets. (The win condition should be moved to server side and double checked agains the servers player score.)
    console.log(name + ' has won!');
  });
});

server.listen(port, () => {
  console.log('Listening on: ' + port);
});