const TCPClient      = require('../socket.js'); // Example TCPClient module
const HttpRequests   = require('../http_requests.js');
const LobbyStartHTML = require('../html/lobby_start.js')
const RoomHTML       = require('../html/room_html.js')

const NET_SERVER_PORT  = 3002;
const IP_ADDR          = 'localhost';

let players = [];

// '/' 
const handleRootRequest = (req, res) => {
  let TCPclient = new TCPClient();

  TCPclient.connect(
      NET_SERVER_PORT, // Port
      IP_ADDR, // Host
      () => { TCPclient.send(`{"getPlayers":""}`); },
      () => { console.log('Connection closed in /'); },
      (error) => { console.error('Connection error in /:', error); }
  );
  TCPclient.onData((data) => {
       players = (JSON.stringify(data)?.charAt(0)==='{'||JSON.stringify(data)?.charAt(0)==='[')
          ? JSON.parse(data)
          : data;
      
      console.log('🟡 / :', players);
  });
  // ---------- end net
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write( LobbyStartHTML(HttpRequests) )
  res.end();
}
// '/add' 
const addUserHandler = (username, players) => {
  if (players?.length === 0 || !players.includes(username)) {
    players.push(username);
    // nickname = decodeURIComponent(body.split(':')[1]);
    let TCPclient = new TCPClient();
    TCPclient.connect(
        NET_SERVER_PORT, // Port
        IP_ADDR, // Host
        () => { TCPclient.send(`{"addPlayer":"${username}"}`); },
        () => { console.log('Connection closed /add'); },
        (error) => { console.error('Connection error /add:', error); }
    );
    // res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end(JSON.stringify(players));
    // res.end();
  } 
}
const handleAddRequest = (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data.toString();
    // console.log('addPlayer:data ['+data.toString()+ ']')
    const nickname = (body.split(':')); //> [ 'addPlayer', 'wert' ]
    const username = nickname[1];

    addUserHandler(username, players)

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end(JSON.stringify(players));
    res.end();
  });
}
// /remove
const removeUserHandler = (username, players) => {
  if (players?.length !== 0 && players.includes(username)) {
    players = players.filter(item => item !== username); //players.filter(user => user.name !== username);
    
    let TCPclient = new TCPClient();
    // -----
    TCPclient.connect(
      NET_SERVER_PORT, // Port
      IP_ADDR, // Host
      () => { TCPclient.send(`{"removePlayer":"${username}"}`); },
      () => { console.log('Connection closed /remove'); },
      (error) => { console.error('Connection error /remove:', error); }
    );
  } 
}
const handleRemoveRequest = (req, res) => {
  let body = '';
  req.on('data', (data) => {
      body += data.toString();
      // console.log('🐙 removePlayer:data ['+data.toString()+ ']')
      const nickname = (body.split(':')); // [ 'removePlayer', 'wert' ]
      const username = nickname[1];

      removeUserHandler(username, players);

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end();
  });
}
// /visibility-state
const handleVisibilityStateRequest = (req, res) => {
  let body = '';
  req.on('data', chunk => {
      body += chunk;
  });
  req.on('end', () => {
    const { visibilityState, username, page } = JSON.parse(body);
    if (username !== null){
      // console.log(username, 'is', visibilityState,'on',page);
      // ---------------  if visible -> add from list
      if (visibilityState === 'visible' && username !== null) {
        addUserHandler(username, players);
      }
      // ---------------  if hidden -> remove from list
      else if (visibilityState === 'hidden' && username !== null) {
        removeUserHandler(username, players);
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end(JSON.stringify(players));
    res.end();
  });
}
// /startGame
const handleStartGame = (req, res) => {
  let body = '';
  let nickname = '';
  let roomID = '';

  req.on('data', (chunk) => {
      body += chunk.toString();
      nickname = decodeURIComponent(body.split('=')[1]);
      // ------
      let TCPclient = new TCPClient();
      TCPclient.connect(
          NET_SERVER_PORT, // Port
          IP_ADDR, // Host
          () => { TCPclient.send(`{"searchRoom":"${nickname}"}`); },
          () => { console.log('Connection closed'); },
          (error) => { console.error('Connection error:', error); }
      );

      TCPclient.onData((data) => {
          const message = (JSON.stringify(data)?.charAt(0)==='{'||JSON.stringify(data)?.charAt(0)==='[')? JSON.parse(data):data;
          console.log('🟡 /startGame ', message);
          roomID = message?.roomID;
          let user1 = message?.players?.user1; 
          let user2 = message?.players?.user2;

          if (roomID?.length>0){
            res.writeHead(302, { 'Location': `/room/${roomID}` }); // < don't change status of 302
            res.write(JSON.stringify({user1,user2})); // ? is needed
            res.end();
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            // res.end(JSON.stringify(players));
            res.end();
          }
      });
  });
}
// /room/...
const handleRoomId = (req, res) => {
  const roomID = req.url.split('/')[2];
  let user1 = ''
  let user2 = ''

  function getPlayers(rooms,roomID) {
    const room = rooms.find((u) => u.roomID === roomID);
    return (room ? room.players : null); // > { user1: 'payload', user2: '' }
  }

  let TCPclient = new TCPClient();
  TCPclient.connect(
      NET_SERVER_PORT, // Port
      IP_ADDR, // Host
      () => { TCPclient.send(`{"roomID":"${roomID}"}`); },
      () => { console.log('Connection closed /room/'); },
      (error) => { console.error('Connection error /room/:', error); }
  );
  TCPclient.onData((data) => {
      const message = (JSON.stringify(data)?.charAt(0)==='{'||JSON.stringify(data)?.charAt(0)==='[')? JSON.parse(data):data;

      if (message?.rooms){
          const players = getPlayers(message.rooms,roomID);
          user1 = players?.user1;
          user2 = players?.user2;
          // console.log('user1,user2',user1,user2)

      } else {
          console.log('Err: no message?.rooms')
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(RoomHTML(roomID,user1,user2,HttpRequests));
      res.end();
  });
}
// /all
const handleGetWholeStorage = (req, res) => {
  let info = {};
  // ----
  let TCPclient = new TCPClient();
  TCPclient.connect(
      NET_SERVER_PORT, // Port
      IP_ADDR, // Host
      () => { TCPclient.send(`{"getStorage":"true"}`); },
      () => { console.log('Connection closed in /all'); },
      (error) => { console.error('Connection error in /all:', error); }
  );
  TCPclient.onData((data) => {
      info = (JSON.stringify(data)?.charAt(0)==='{'||JSON.stringify(data)?.charAt(0)==='[')
          ? JSON.parse(data)
          : data;
      // console.log('🟡 /all: [players:'+ info.players.length+'], [rooms:'+info.rooms.length+']' )

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(info))
      res.end();
  });
}
// /get
const handleGetPlayers = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(players));
}

module.exports = {
  handleRootRequest,
  handleRoomId,
// post
  handleAddRequest,
  handleRemoveRequest,
  handleVisibilityStateRequest,
  handleStartGame,
// get
  handleGetWholeStorage,
  handleGetPlayers,
};
