// Server code (with HTTP server)
const net = require('net');
const { v4: uuidv4 } = require('uuid');
// const http = require('http');

const NetServer = net.createServer();
let sockets = []; // Store connected client sockets
let players = [];
let rooms = [  {
    playerCounter: 1,
    nickname: 'om1',
    roomID: '97b8645d-4f94-47b1-9d5c-acef290c2f61',
    players: { user1: 'lele', user2: '' }
  }
];
let countPeople = 0;
const waitingQueue = [];
let roomID = '';

const NET_SERVER_PORT  = 3002;

function broadcast(message) {
    sockets.forEach(socket => {
        console.log('📢'," - ", message)
        socket.write(message);
    });
}

// bind 
NetServer.on('connection', (socket) => {
    // console.log('New client request...');
    sockets.push(socket);
    ++countPeople; // counting active users
  
    socket.on('data', (data) => {
      const message = JSON.parse(data.toString());
      console.log('🍉 message', message);
      const action = Object.keys(message)[0];
      const payload = message[action];
    
       // ----------add player----------
      if (action === 'addPlayer') { // {"addPlayer":"wert"}

        const username = payload;
        const noMatch = players?.length!==0 || players.some(player => player.username !== username);
        if (username && !noMatch) {
          players.push({ sock: socket.remoteAddress, username, id: countPeople });
          const playersList = JSON.stringify(players.map(player => player.username));
          broadcast(playersList);
        //   console.log('🌹',{ sockId: socket.remoteAddress, username, id: countPeople })
        }
        // console.log('addPlayer:players',players)
      }
    // ----------get players----------
      else if (action === 'getPlayers') {
        const playersList = JSON.stringify(players.map(player => player.username));
        console.log('TCP:playersList',playersList)
        socket.write(playersList);
      }
    //   ----------search room----------
      else if (action === 'searchRoom'){
        let isTwoPlayers = 0;
        waitingQueue.push(payload); // pushing each username

        let info;
        if (waitingQueue.length === 1) {
            roomID = uuidv4();
            isTwoPlayers = 1;
            info = {
                'playerCounter':isTwoPlayers,
                'nickname':payload, 
                roomID, 
                players: { 
                    user1: payload,
                    user2: ''
                }}
            socket.write(JSON.stringify(info));
            // socket.write(JSON.stringify(`⚪️ Waiting for second player... ${payload} - ID ${roomID} - wait ${JSON.stringify(waitingQueue)}`));
        } 
        // already one in queue
        else if (waitingQueue.length === 2) {
            isTwoPlayers = 2;
             info = {
                'playerCounter':isTwoPlayers,
                'nickname':payload, 
                roomID, 
                players: { 
                    user1: waitingQueue.shift(),
                    user2: waitingQueue.shift() 
                }};
            socket.write(JSON.stringify(info));
        } else {
            ++isTwoPlayers;
            socket.write(`???... ${payload} - ID ${roomID}`);
        }
        rooms.push(info);
        console.log('waitingQueue',waitingQueue,'isTwoPlayers:',isTwoPlayers, 'roomID',roomID,rooms)
        // const user1 = waitingQueue.shift();
        // const user2 = { , nickname };

      } 
    //   ---------roomID----------------
      else if (action === 'roomID'){
        socket.write(JSON.stringify({rooms,players}))
      }
    });
    // sockets.forEach(e=>console.log('⚪️',sockets))
    
  
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
  
NetServer.listen(NET_SERVER_PORT, () => {
  console.log(`Server listening on port ${NET_SERVER_PORT}`);
});
