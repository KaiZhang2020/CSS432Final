// Server code (with HTTP server)

// Include the net module
const net = require('net');

const NetServer = net.createServer();
const sockets = []; // Store connected client sockets
let players = []; // Array to store player information

// const HTTP_SERVER_PORT = 3000;
const NET_SERVER_PORT  = 3001;
// const IP_ADDR          = 'localhost';

// bind
NetServer.on('connection', (socket) => {
    console.log('New client request...');
    sockets.push(socket); // Add new socket to the sockets array
  
    // Event listener for data received from a client
    socket.on('data', (data) => {
      const message = data.toString().trim();
      const [action, payload] = message.split(':');
      
      // Handle adding a new player
      if (action === 'addPlayer') {
        const username = payload;
        if (username) {
          players.push({ sock: socket.remoteAddress, username });
          const playersList = JSON.stringify(players.map(player => player.username));
          broadcast(playersList); // Broadcast new players list
          console.log(username, 'connected!');
        }
      } else if (action === 'getPlayers') {
        // Handle request to get current players
        const playersList = JSON.stringify(players.map(player => player.username));
        socket.write(playersList);
      }
    });
  
    // Event listener for client disconnection
    socket.on('end', () => {
      console.log('Client disconnected');
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1); // Remove socket from the array
      }
      players = players.filter(player => player.sock !== socket.remoteAddress);
      const playersList = JSON.stringify(players.map(player => player.username));
      broadcast(playersList); // Broadcast updated players list
    });
  
    // Event listener for socket errors
    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });
  });
  
  // Function to brooadcast a message to all connected clients
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

// Start listening on the specified TCP servet port
NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});
