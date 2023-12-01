// Server code (with HTTP server)
const net = require('net');
// const http = require('http');

const NetServer = net.createServer();
const sockets = []; // Store connected client sockets
let players = [];

// const HTTP_SERVER_PORT = 3000;
const NET_SERVER_PORT  = 3001;
// const IP_ADDR          = 'localhost';

// bind
NetServer.on('connection', (socket) => {
    console.log('New client request...');
    sockets.push(socket);
  
    socket.on('data', (data) => {
      const message = data.toString().trim();
      const [action, payload] = message.split(':');
      
      if (action === 'addPlayer') {
        const username = payload;
        if (username) {
          players.push({ sock: socket.remoteAddress, username });
          const playersList = JSON.stringify(players.map(player => player.username));
          broadcast(playersList);
          console.log(username, 'connected!');
        }
      } else if (action === 'getPlayers') {
        const playersList = JSON.stringify(players.map(player => player.username));
        socket.write(playersList);
      }
    });
  
    socket.on('end', () => {
      console.log('Client disconnected');
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1);
      }
      players = players.filter(player => player.sock !== socket.remoteAddress);
      const playersList = JSON.stringify(players.map(player => player.username));
      broadcast(playersList);
    });
  
    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });
  });
  
  function broadcast(message) {
    sockets.forEach(socket => {
      socket.write(message);
    });
  }
// NetServer.on('connection', (socket) => {
//   console.log('New client request...');
//   sockets.push(socket);

//   // listen
//   socket.on('data', (data) => {
//     const username = data.toString().trim(); // Assuming the username is sent as a string
//     if (username) {
//       players = [...players, {sock: socket.remoteAddress, username}];
//       const playersList = JSON.stringify(Object.values(players));
//       for (const clientSocket of sockets) {
//         clientSocket.write(playersList);
//       }
//       console.log(username, 'connected!');
//     }
//   });

//   socket.on('end', () => {
//     console.log('Client disconnected');
//     const index = sockets.indexOf(socket);
//     if (index !== -1) {
//       sockets.splice(index, 1);
//     }
//     delete players[socket.remoteAddress];
//   });

//   socket.on('error', (err) => {
//     console.error('Socket error:', err.message);
//   });
// });

NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});
