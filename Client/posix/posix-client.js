// Client code (with HTTP request)
const net = require('net');
const http = require('http');

const NetClient = new net.Socket();
const username = 'M8';

let players = [];

const NET_SERVER_PORT  = 3001;
const HTTP_SERVER_PORT = 3000;
const IP_ADDR          = 'localhost';

NetClient.connect(NET_SERVER_PORT, IP_ADDR, () => {
  console.log('Connected to lobby server');
  NetClient.write(username);
});

// Function to send player list to HTTP NetClients 
function sendPlayerList(res) {
    //   res.writeHead(200, { 'Content-Type': 'application/json' });
    res.setHeader('Content-Type', 'text/html' )
    res.write(`
        <input type='text' id='usernameInput' placeholder='Enter username'>
        <button id='addButton'>Add Username</button>
        <div id='playerList'>Players List:</div>
    `)
    res.write(JSON.stringify(players)+'\n')

    res.end(JSON.stringify(Object.values(players)));
}

// Create an HTTP server
const httpServer = http.createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/players') {
        sendPlayerList(res); // Send player list when requested by browser
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

httpServer.listen(HTTP_SERVER_PORT, IP_ADDR, () => {
    console.log(`HTTP server listening on port ${HTTP_SERVER_PORT}`);
});

httpServer.on("connection", ()=> {
    // Function to update player list in the HTML
    function updatePlayerList(players) {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = players.map(player => `<li>${player}</li>`).join('');
    }
    // Retrieve player list and update UI every 5 seconds
    setInterval(() => {
        updatePlayerList(players); // Update the player list in the HTML
    }, 5000);
})

NetClient.on('data', (data) => {
    players = JSON.parse(data.toString());
    console.log('🟡Current players in the lobby:', players);
})

NetClient.on('close', () => {
  console.log('Connection to lobby server closed');
});
