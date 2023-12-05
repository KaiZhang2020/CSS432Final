const net = require('net');
const { v4: uuidv4 } = require('uuid');


const NetServer = net.createServer();
let sockets = []; // Store connected client sockets
let players = [];
let rooms = [  {
    playerCounter: 1,
    nickname: 'test_user',
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
        console.log('📢>', message)
        socket.write(message);
    });
}

function findAndUpdateUserLocation(username, newLocation) {
    const userIndex = players.findIndex(player => player.username === username);
  
    if (userIndex !== -1) {
      players[userIndex].currentLocation = newLocation;
      console.log(`🔵 ${username} location updated to ${newLocation}.`);
    } 
    return players[userIndex];
    // else { return `User ${username} not found.`; }
}
// Function to update players in a room by roomID
function updatePlayersInRoom(roomID, updatedPlayers) {
    const roomToUpdate = rooms.find(room => room.roomID === roomID);
    // findAndUpdateUserLocation()
    if (roomToUpdate) {
      roomToUpdate.players = updatedPlayers;
    //   roomToUpdate.playerCounter = updatedPlayerCounter;
      // roomToUpdate.nickname = updatedNickname;
    } else {
      console.log('Room not found');
    }
    return roomToUpdate;
}

  
// bind 
NetServer.on('connection', (socket) => {
    // console.log('New client request...');
    sockets.push(socket);
    ++countPeople; // counting active users
  
    socket.on('data', (data) => {
    const message = JSON.parse(data.toString());
    console.log('🍉>', message);
    const action = Object.keys(message)[0];
    const payload = message[action];
    
    // ----------add player----------
    if (action === 'addPlayer') { // {"addPlayer":"wert"}
        const username = payload;
        const matchFound =  players.length > 0 && players.some(player => player.username === username);
        if (username && !matchFound) {
            players.push({ 
                sock: socket.remoteAddress, 
                username, 
                currentLocation: 'lobby',
                id: countPeople, 
            });
            // const playersList = JSON.stringify(players.map(player => player.username));
            // broadcast('ok');
        } else {
            // not a ner user
            // console.log('findAndUpdateUserLocation(payload, "lobby")',findAndUpdateUserLocation(payload, 'lobby'))
            findAndUpdateUserLocation(payload, 'room')
        }
        console.log('🐳addPlayer:players',players)

    }
    // ----------remove player----------
    else if (action === 'removePlayer') { // {"addPlayer":"wert"}
        const username = payload;
        const matchFound =  players.length > 0 && players.some(player => player.username === username);
        if (username && matchFound) {
            players =  players.filter(user => user.username !== username);
            
            console.log('👍',players?.length+' removed')
        } else {
            console.log('⛔️',username+' cant be removed')
        }
        console.log('removePlayer:players',players)

    }
    
    // ----------get players----------
    else if (action === 'getPlayers') {
        const playersList = JSON.stringify(players.map(player => player.username));
        // console.log('TCP:playersList',playersList)
        // const allData = JSON.stringify(dataStorage)
        
        // console.log('TCP:🦄',allData)
        socket.write(playersList);

        console.log('getPlayer:players',players)
    }
    // ----------get players+rooms----------
    else if (action === 'getStorage') {
        socket.write(JSON.stringify({ players,rooms }))
    }
    //   ----------search room----------
    else if (action === 'searchRoom'){
        let isTwoPlayers = 0;
        waitingQueue.push(payload); // pushing each username

        let info;
        setTimeout(() => {
            const matchFound =  players.length > 0 && players.some(player => player.username === payload);
            console.log('👽matchFound',matchFound,players)
            if (payload && !matchFound) {
                players.push({ 
                    sock: socket.remoteAddress, 
                    username:payload, 
                    currentLocation: 'room',
                    id: countPeople, 
                });
            } else {
                findAndUpdateUserLocation(payload, 'room')
            }    
        }, 2000);

        console.log('🐳searchRoom:players',players)

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
            rooms.push(info);
            // updadting player's location 
            // findAndUpdateUserLocation(payload,'room');
            // socket.write(JSON.stringify(`⚪️ Waiting for second player... ${payload} - ID ${roomID} - wait ${JSON.stringify(waitingQueue)}`));
        } 
        // already one in queue
        else if (waitingQueue.length === 2) {
            const updatedPlayers = { 
                user1: waitingQueue.shift(),
                user2: waitingQueue.shift()
            }; 
            // const updatedPlayer = waitingQueue.shift(); // Updated players object
        
            const updaterRoom = updatePlayersInRoom(roomID, updatedPlayers);
            isTwoPlayers = 2;
            // findAndUpdateUserLocation(payload,'room');
            socket.write(JSON.stringify(updaterRoom));
        } else {
            ++isTwoPlayers;
            socket.write(`???... ${payload} - ID ${roomID}`);
        }
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

    socket.on('end', () => {
        // remove from playersList
        // --countPeople;
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
