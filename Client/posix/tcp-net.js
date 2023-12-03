// Server code (with HTTP server)
const net = require('net');
// const http = require('http');

const NetServer = net.createServer();
const sockets = []; // Store connected client sockets
let players = [];
let countPeople = 0;

// const HTTP_SERVER_PORT = 3000;
const NET_SERVER_PORT  = 3001;
// const IP_ADDR          = 'localhost';

// bind 
NetServer.on('connection', (socket) => {
    console.log('New client request...');
    sockets.push(socket);
  
    socket.on('data', (data) => {
      const message = data.toString().trim();
      console.log('🍉 message', message);
      const [action, payload] = message.split(':');
    
      if (action === 'addPlayer') {
        const username = payload;
        if (username) {
          ++countPeople; // counting active users
          players.push({ sock: socket.remoteAddress, username, id: ++id });
          const playersList = JSON.stringify(players.map(player => player.username));
          broadcast(playersList);
          console.log(username, 'connected!', 'Total: ',countPeople);
        }
      } else if (action === 'getPlayers') {
        const playersList = JSON.stringify(players.map(player => player.username));
        socket.write(playersList);
      }
    });
  
    // socket.on('end', () => {
    //   console.log('Client disconnected');
    //   const index = sockets.indexOf(socket);
    //   if (index !== -1) {
    //     sockets.splice(index, 1);
    //   }
    //   players = players.filter(player => player.sock !== socket.remoteAddress);
    //   const playersList = JSON.stringify(players.map(player => player.username));
    //   broadcast(playersList);
    // });

  socket.on('end', () => {
    --countPeople;
    console.log('🚪 Client disconnected', 'Total:' , countPeople);
    const index = sockets.indexOf(socket);
    if (index !== -1) {
      sockets.splice(index, 1);
    }
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

NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});
