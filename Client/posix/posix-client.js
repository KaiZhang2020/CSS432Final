// Client code (with HTTP request)

// Include required modules
const net = require('net');
const http = require('http');

// Create a new TCP client using net module
const NetClient = new net.Socket();
const username = 'M8'; // Username for this client

let players = []; // Array to store player information

// Define server port and IP address
const NET_SERVER_PORT  = 3001;
const HTTP_SERVER_PORT = 3000;
const IP_ADDR          = 'localhost';

// Connect to the TCP server
NetClient.connect(NET_SERVER_PORT, IP_ADDR, () => {
  console.log('Connected to lobby server');
  NetClient.write(username); // Send username to server upon connection
});

// Function to send player list to HTTP clients in a browser-friendly format
function sendPlayerList(res) {
    //   res.writeHead(200, { 'Content-Type': 'application/json' });
    // Set the content type of the response
    res.setHeader('Content-Type', 'text/html' );
    // Write HTML content for displaying players
    res.write(`
        <input type='text' id='usernameInput' placeholder='Enter username'>
        <button id='addButton'>Add Username</button>
        <div id='playerList'>Players List:</div>
    `)
    // Append the list of players as JSON string
    res.write(JSON.stringify(players)+'\n')

    // End the response with the JSON string of players
    res.end(JSON.stringify(Object.values(players)));
}

// Create an HTTP server
const httpServer = http.createServer((req, res) => {
    // Handle GET request for players list
    if (req.method === 'GET' && req.url === '/players') {
        sendPlayerList(res); // Send player list when requested by browser
    } else {
        // Respond with 404 for all other requests
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start listening on the specified HTTP server port
httpServer.listen(HTTP_SERVER_PORT, IP_ADDR, () => {
    console.log(`HTTP server listening on port ${HTTP_SERVER_PORT}`);
});

// Event listener for HTTP server connections
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

// Event listener for data received from TCP server
NetClient.on('data', (data) => {
    // Update players array with new data
    players = JSON.parse(data.toString());
    console.log('🟡Current players in the lobby:', players);
})

// Event listener for TCP client disconnection
NetClient.on('close', () => {
  console.log('Connection to lobby server closed');
});
