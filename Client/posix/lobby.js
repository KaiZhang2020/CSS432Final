
const http         = require('http');
const FileHandler   = require('./handlers/fileHandler.js');
const ScoreBoardHTML = require('./html/scoreboard.js');
const { handleRootRequest,
        handleRoomId,
        handleAddRequest, // post
        handleRemoveRequest, // post
        handleVisibilityStateRequest, // post
        handleStartGame, // post
        handleGetWholeStorage, // get
        handleGetPlayers, // get
      } = require('./handlers/requestHandlers.js');

const LAN_IP_ADDRESS = '192.168.0.3'; // LAN: http://192.168.0.3:3000/
const HTTP_SERVER_PORT = 3000;

const server = http.createServer((req, res) => {
    // ---------------------- / ----------------------
    if (req.url === '/'){
        handleRootRequest(req, res);
    }  
    // ---------------------- /add ----------------------
    else if (req.url === '/add' && req.method === 'POST' ){
        handleAddRequest(req, res);
    }
    // ---------------------- /remove ----------------------
    else if (req.url === '/remove' && req.method === 'POST' ){
        handleRemoveRequest(req, res);
    }
    // --------------------/visibility-state--------------------
    else if (req.url === '/visibility-state' && req.method === 'POST') {
        handleVisibilityStateRequest(req, res) 
    } 
    // ---------------------- /get ----------------------
    else if (req.url === '/get' && req.method === 'GET' ){
        handleGetPlayers(req, res)
    } 
    // ---------------------- /get ----------------------
    else if (req.url === '/all' && req.method === 'GET' ){
        handleGetWholeStorage(req, res);
    }  
    // --------------------/startGame--------------------
    else if (req.url === '/startGame' && req.method === 'POST') {
        handleStartGame(req, res);
    } 
    // --------------------/room/ID--------------------
    else if (req.url.startsWith('/room/')) {
        handleRoomId(req, res);
    }
    // ---------------------- /scoreboard ----------------------
    else if ( req.url === '/scoreboard' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(ScoreBoardHTML());
        res.end();
    }
    // --------------------styles & fonts --------------------
    else {
        FileHandler.handleFileRequests(req, res);
        // res.writeHead(404, { 'Content-Type': 'text/plain' });
        // res.end('Not Found');
    }
});

server.listen(HTTP_SERVER_PORT, LAN_IP_ADDRESS, () => {
  console.log(`Server running on port ${HTTP_SERVER_PORT}`);
});
