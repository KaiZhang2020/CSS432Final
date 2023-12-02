// Include required modules
const net = require('net'); // For TCP connections
const http = require('http'); // For HTTP connections

// Creating a TCP server using the net module
const NetServer = net.createServer();
const sockets = []; // Array to keep track of connected sockets
let players = []; // Array to store player information
let id = 0; // Player ID, incremented for each new player

// Ports for TCP and HTTP servers
const NET_SERVER_PORT = 3001;
const HTTP_SERVER_PORT = 3000;

// Handling new TCP connections
NetServer.on('connection', (socket) => {
  console.log('New client request...');
  sockets.push(socket); // Add the new socket to the sockets array

  // Handling data received from a client
  socket.on('data', (data) => {
    const message = data.toString().trim(); // Convert buffer to string and trim it
    const [action, payload] = message.split(':'); // Split the message into action and payload
    
    // Adding a new player
    if (action === 'addPlayer') {
      const username = payload;
      if (username) {
        players.push({ username, id: ++id }); // Increment ID and add new player
        const playersList = JSON.stringify(players.map(player => player.username));
        broadcast(playersList); // Broadcast updated players list to all clients
        console.log(username, 'connected!');
      }
    } 
    // Sending the players list to a client
    else if (action === 'getPlayers') {
      const playersList = JSON.stringify(players.map(player => player.username));
      socket.write(playersList); // Send players list to the requester
    }
  });

  // Handling client disconnection
  socket.on('end', () => {
    console.log('Client disconnected');
    const index = sockets.indexOf(socket);
    if (index !== -1) {
      sockets.splice(index, 1); // Remove the disconnected socket from the array
    }
    players = players.filter(player => player.sock !== socket.remoteAddress);
    const playersList = JSON.stringify(players.map(player => player.username));
    broadcast(playersList); // Broadcast updated players list
  });

  // Handling socket errors
  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

// Broadcast a message to all connected sockets
function broadcast(message) {
  sockets.forEach(socket => {
    socket.write(message); // Send the message to each connected client
  });
}

// Start listening on the specified TCP server port
NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});

// Creating an HTTP server using the http module
const httpServer = http.createServer((req, res) => {
  // Handling GET requests to the root URL
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    // Send HTML content to the client
    res.write(`
      <input type='text' id='usernameInput' placeholder='Enter username'>
      <button id='addButton'>Add Username</button>
      <div id='playerList'>Players List:</div>
      <script>
        function updatePlayerList(players) {
          const playerList = document.getElementById('playerList');
          playerList.innerHTML = players.map(player => \`<li>\${player}</li>\`).join('');
        }

        function getPlayers() {
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                const players = JSON.parse(xhr.responseText);
                updatePlayerList(players);
              } else {
                console.error('Error fetching players:', xhr.status);
              }
            }
          };
          xhr.open('GET', '/players');
          xhr.send();
        }

        document.getElementById('addButton').addEventListener('click', () => {
          const username = document.getElementById('usernameInput').value;
          if (username) {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                  const players = JSON.parse(xhr.responseText);
                  updatePlayerList(players);
                } else {
                  console.error('Error adding player:', xhr.status);
                }
              }
            };
            xhr.open('POST', '/addPlayer');
            xhr.setRequestHeader('Content-Type', 'text/plain');
            xhr.send('addPlayer:' + username);
          } else {
            console.error('Please enter a username');
          }
        });

        setInterval(getPlayers, 5000);
        getPlayers();
      </script>
    `);
    res.end();
  } 
  // Handling GET requests for the players list
  else if (req.method === 'GET' && req.url === '/players') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const playersList = JSON.stringify(players.map(player => player.username));
    res.end(playersList); // Send the players list as JSON
  } 
  // Handling POST requests for adding a new player
  else if (req.method === 'POST' && req.url === '/addPlayer') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // Accumulate the data chunks
    });
    req.on('end', () => {
      const username = body.slice(9); // Extract username from the received data
      if (username) {
        players.push({ username, id: --id }); // Decrement ID and add new player
        const playersList = JSON.stringify(players.map(player => player.username));
        broadcast(playersList); // Broadcast updated players list
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(playersList); // Send updated players list
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid username'); // Send error response for invalid username
      }
    });
  } 
  // Handling all other requests
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found'); // Send a 404 response
  }
});

// Start listening on the specified HTTP server port
httpServer.listen(HTTP_SERVER_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_SERVER_PORT}`);
});
