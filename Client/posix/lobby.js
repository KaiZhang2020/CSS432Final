
const http         = require('http');
const TCPClient    = require('./socket.js');
const HttpRequests = require('./http_requests.js');
const RoomHTML     = require('./html/room_html.js')
const LobbyStartHTML     = require('./html/lobby_start.js')
const path = require('path'); // for fonts and styles
const fs = require('fs');  // for fonts and styles


const HTTP_SERVER_PORT = 3000;
const NET_SERVER_PORT  = 3002;
const IP_ADDR          = 'localhost';

let players = [];

function getPlayers(rooms,roomID) {
    const room = rooms.find((u) => u.roomID === roomID);
    return (room ? room.players : null); // > { user1: 'payload', user2: '' }
  }

const server = http.createServer((req, res) => {
    let TCPclient = undefined;
    // ---------------------- / ----------------------
    if (req.url === '/'){
        TCPclient = new TCPClient();
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
        // const cssContent = fs.readFileSync('./html/styles/lobbystyle.css', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(
            LobbyStartHTML(HttpRequests)
        )
        res.end();
    }  
    // ---------------------- /add ----------------------
    else if (req.url === '/add' && req.method === 'POST' ){
        let body = '';
        req.on('data', (data) => {
            body += data.toString();
            console.log('addPlayer:data ['+data.toString()+ ']')
            const nickname = (body.split(':'));//body.split(":"); // [ 'addPlayer', 'wert' ]

            if (players?.length === 0 || !players.includes(nickname[1])) {
                players.push(nickname[1]);
                // nickname = decodeURIComponent(body.split(':')[1]);
                TCPclient = new TCPClient();
                TCPclient.connect(
                    NET_SERVER_PORT, // Port
                    IP_ADDR, // Host
                    () => { TCPclient.send(`{"addPlayer":"${nickname[1]}"}`); },
                    () => { console.log('Connection closed /add'); },
                    (error) => { console.error('Connection error /add:', error); }
                );
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid username');
            }

        });
    }     
    // ---------------------- /remove ----------------------
    else if (req.url === '/remove' && req.method === 'POST' ){
        console.log('🐙 removePlayer')
        let body = '';
        req.on('data', (data) => {
            body += data.toString();
            console.log('🐙 removePlayer:data ['+data.toString()+ ']')
            const nickname = (body.split(':'));//body.split(":"); // [ 'removePlayer', 'wert' ]

            if (players?.length !== 0 && !players.includes(nickname[1])) {

                players =  players.filter(user => user.username !== nickname[1]);
                // players.push(nickname[1])
                // nickname = decodeURIComponent(body.split(':')[1]);
                TCPclient = new TCPClient();
                TCPclient.connect(
                    NET_SERVER_PORT, // Port
                    IP_ADDR, // Host
                    () => { TCPclient.send(`{"removePlayer":"${nickname[1]}"}`); },
                    () => { console.log('Connection closed /remove'); },
                    (error) => { console.error('Connection error /remove:', error); }
                );
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('ok');
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid username');
            }

        });
    } 
    // --------------------/visibility-state--------------------
    else if (req.url === '/visibility-state' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
    
        req.on('end', () => {
            const { visibilityState, username, page } = JSON.parse(body);
            console.log(username, 'is', visibilityState,'on',page);

            // ---------------  if visible -> add from list
            if (visibilityState === 'visible') {
                // console.log('🐙 addPlayer:data ['+body.toString()+ ']',)

                if (players?.length === 0 || !players.includes(username)) {
                    players.push(username);

                    TCPclient = new TCPClient();
                    TCPclient.connect(
                        NET_SERVER_PORT, // Port
                        IP_ADDR, // Host
                        () => { TCPclient.send(`{"addPlayer":"${username}"}`); },
                        () => { console.log('Connection closed /remove'); },
                        (error) => { console.error('Connection error /remove:', error); }
                    );
                    
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('ok');
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Invalid username for /add in /visibility-state');
                }
            } 
            // ---------------  if hidden -> remove from list
            else if (visibilityState === 'hidden') {
                console.log('🐙 removePlayer:data ['+body.toString()+ ']',)

                if (players?.length !== 0 && players.includes(username)) {
                    players =  players.filter(user => user.username !== username);
                    TCPclient = new TCPClient();
                    TCPclient.connect(
                        NET_SERVER_PORT, // Port
                        IP_ADDR, // Host
                        () => { TCPclient.send(`{"removePlayer":"${username}"}`); },
                        () => { console.log('Connection closed /remove'); },
                        (error) => { console.error('Connection error /remove:', error); }
                    );

                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('ok');
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Invalid username for /remove in /visibility-state');
                }

                // console.log('fetchOptions:::',fetchOptions.body)
                // fetch(`http://${IP_ADDR}/remove`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'text/plain'},
                //     body: `removePlayer:${username}`
                // })
                //     .then(response => {
                //         if (response?.ok) {
                //             console.log('🏆 200','ok')
                //             res.writeHead(200, { 'Content-Type': 'text/plain' });
                //             res.end('Removed user on visibility state change');
                //         } else {
                //             console.log('🏆 500','NOTok', response)
                //             res.writeHead(500, { 'Content-Type': 'text/plain' });
                //             res.end('Error removing user on visibility state change');
                //         }
                //     })
                //     .catch(error => {
                //         console.log('🏆 ERR','NOTok',error)
                //         // console.error('Error removing user:', error);
                //         res.writeHead(500, { 'Content-Type': 'text/plain' });
                //         res.end('Error removing user on visibility state change');
                //     });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid visibility state');
            }
        });
    } 
    // ---------------------- /get ----------------------
    else if (req.url === '/get' && req.method === 'GET' ){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const playersList = JSON.stringify(players);
        res.end(playersList);
    } 
    // ---------------------- /get ----------------------
    else if (req.url === '/all' && req.method === 'GET' ){
        let info = {};
        TCPclient = new TCPClient();
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
        // ---------- end net
    }  
    //   --------------------/startGame--------------------
    else if (req.url === '/startGame' && req.method === 'POST') {
        let body = '';
        let nickname = '';
        let roomID = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
            nickname = decodeURIComponent(body.split('=')[1]);
            // ------ tcp start -----
            TCPclient = new TCPClient();
            TCPclient.connect(
                NET_SERVER_PORT, // Port
                IP_ADDR, // Host
                () => { TCPclient.send(`{"searchRoom":"${nickname}"}`); },
                () => { console.log('Connection closed'); },
                (error) => { console.error('Connection error:', error); }
            );

            TCPclient.onData((data) => {
                const message = (JSON.stringify(data)?.charAt(0)==='{'||JSON.stringify(data)?.charAt(0)==='[')? JSON.parse(data):data;
                console.log('🟡 /startGame ', message)
                roomID = message?.roomID;
                user1 = message?.players?.user1;
                user2 = message?.players?.user2;

                if (roomID?.length>0){
                    res.writeHead(302, { 'Location': `/room/${roomID}` });
                    res.end();
                }
            });
        });
    } 
    //   --------------------/room/ID--------------------
    else if (req.url.startsWith('/room/')) {
        const roomID = req.url.split('/')[2];
        let user1 = ''
        let user2 = ''

        if (!TCPclient) {
            console.log('Recreating TCP connection... for /room/{roomID}')
            TCPclient = new TCPClient();
            TCPclient.connect(
                NET_SERVER_PORT, // Port
                IP_ADDR, // Host
                () => { TCPclient.send(`{"roomID":"${roomID}"}`); },
                () => { console.log('Connection closed /room/'); },
                (error) => { console.error('Connection error /room/:', error); }
            );

        } else {
            console.log('No need to recreate connection...')
            TCPclient.send(`{"roomID":"${roomID}"}`);
        }

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
            res.end( 
                RoomHTML(roomID,user1,user2,HttpRequests)
            );
        });
    }
    // ---------------------- /next ----------------------
    else if ( req.url === '/next' && req.method === 'GET') {
        // Handle redirection after button click
        res.writeHead(200, { 'Location': '/next','Content-Type': 'text/html' });
        res.write(`
            <h1>This is test empty page</h1>
            <button onclick="redirectToNext()">Go to Main Page</button>
            <script>
            function redirectToNext() {
                window.location.href = '/';
            }
            </script>
        `);
        res.end();
    }
    // ---------------------- /fonts ----------------------
    else if (req.url === '/fonts/Dekko-Regular.ttf') {
        const fontPath = path.join(__dirname, 'html', 'styles', 'Dekko-Regular.ttf'); 
   
        fs.readFile(fontPath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'font/ttf' });
            res.end(data);
          }
        });
    } 
    // ---------------------- /styles ----------------------
    else if (req.url === '/lobbystyle.css') {
        const filePath = path.join(__dirname, 'html', 'styles', 'lobbystyle.css'); // Adjust the path as needed
    
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    } 
    //   --------------------/404 --------------------
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
    
});

server.listen(HTTP_SERVER_PORT, () => {
  console.log(`Server running on port ${HTTP_SERVER_PORT}`);
});
