const net = require('net');
const http = require('http');

const NetServer = net.createServer();
const sockets = [];
let players = [];
let id = 0;

const NET_SERVER_PORT = 3001;
const HTTP_SERVER_PORT = 3000;

NetServer.on('connection', (socket) => {
  console.log('New client request...');
  sockets.push(socket);

  socket.on('data', (data) => {
    const message = data.toString().trim();
    const [action, payload] = message.split(':');
    
    if (action === 'addPlayer') {
      const username = payload;
      if (username) {
        players.push({ username, id: ++id });
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

NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});

const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
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
  } else if (req.method === 'GET' && req.url === '/players') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const playersList = JSON.stringify(players.map(player => player.username));
    res.end(playersList);
  } else if (req.method === 'POST' && req.url === '/addPlayer') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const username = body.slice(9); // Remove 'addPlayer:' prefix
      if (username) {
        players.push({ username,id: --id });
        const playersList = JSON.stringify(players.map(player => player.username));
        broadcast(playersList);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(playersList);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid username');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

httpServer.listen(HTTP_SERVER_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_SERVER_PORT}`);
});
