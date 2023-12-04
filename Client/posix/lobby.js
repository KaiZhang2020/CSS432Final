const http = require('http');
// const net = require('net');
const TCPClient = require('./sock.js')
// const { v4: uuidv4 } = require('uuid'); // For generating unique room IDs

let players = [];

const HTTP_SERVER_PORT = 3000;
const NET_SERVER_PORT  = 3002;
const IP_ADDR          = 'localhost';


function getPlayers(rooms,roomID) {
    const room = rooms.find((u) => u.roomID === roomID);
    return (room ? room.players : null); // > { user1: 'payload', user2: '' }
  }

const server = http.createServer((req, res) => {
    let TCPclient = undefined;
    // --------------------/lobby--------------------
    if (req.url === '/lobby') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
        <html>
            <body>
            <h1>Welcome to the Game Lobby</h1>
            <form action="/startGame" method="post">
                <input type="text" name="nickname" placeholder="Enter your nickname" required>
                <input type="submit" value="Start Game">
            </form>
            </body>
        </html>
        `);
    } 
    //   --------------------/startGame--------------------
    else if (req.url === '/startGame' && req.method === 'POST') {
        let body = '';
        let nickname = '';
        let roomID = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
            nickname = decodeURIComponent(body.split('=')[1]);
            // console.log('🦊body',body)
            TCPclient = new TCPClient();
            TCPclient.connect(
                NET_SERVER_PORT, // Port
                IP_ADDR, // Host
                () => { TCPclient.send(`{"searchRoom":"${nickname}"}`); },
                () => {  console.log('Connection closed'); },
                (error) => {  console.error('Connection error:', error);  }
            );

            TCPclient.onData((data) => {
                // console.log('(typeof data)',(typeof data))
                const message = JSON.stringify(data)?.charAt(0)==='{'? JSON.parse(data):data;
                // console.log('🟡 received ', message," - ", nickname)
                roomID = message?.roomID;
                user1 = message?.players.user1;
                user2 = message?.players.user2;
                // console.log('🦊req',req, 'nickname',nickname,'roomID',roomID)

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
                console.log('Recreating TCP connection...')
                TCPclient = new TCPClient();
                TCPclient.connect(
                    NET_SERVER_PORT, // Port
                    IP_ADDR, // Host
                    () => { TCPclient.send(`{"roomID":"${roomID}"}`); },
                    () => {  console.log('Connection closed'); },
                    (error) => {  console.error('Connection error:', error);  }
                );

            } else {
                console.log('No need to recreate connection...')
                TCPclient.send(`{"roomID":"${roomID}"}`);
            }

            TCPclient.onData((data) => {
                // console.log('(typeof data)',(typeof data))//JSON.stringify(data)
                const message = JSON.stringify(data)?.charAt(0)==='{'? JSON.parse(data):data;
                // console.log('🟡 received ', message," - ")

                if (message?.rooms){
                    const players = getPlayers(message.rooms,roomID);
                    user1 = players?.user1;
                    user2 = players?.user2;
                    // console.log('user1,user2',user1,user2)

                } else {
                    console.log('Err: no message?.rooms')
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`<html>
                    <body><h4>Welcome to Room <br/>${roomID}</h4><h5 id='usernames'>User 1: ${user1} <br/>User 2: ${user2}</h5></body>
                    <script>
                        if (\`${user1}\`==='undefined'&&\`${user2}\`==='undefined'){ // redirect to /lobby if no user1
                            window.location.href = '/lobby';
                        }
                        let user = [];
                        function changeContent(elementId, text) {
                            var element = document.getElementById(elementId);
                            if (element) {
                                element.textContent = text;
                            } else {
                                console.log('Element for changeContent(elementId, text) not found');
                            }
                        }
                        const storedValue = sessionStorage.getItem('username');
                        console.log('username',storedValue)
                    </script>
                </html>`);
            });
    }
    // ---------------------- / ----------------------
    else if (req.url === '/'){
        // let playerList = [];

        TCPclient = new TCPClient();
        TCPclient.connect(
            NET_SERVER_PORT, // Port
            IP_ADDR, // Host
            () => { TCPclient.send(`{"getPlayers":""}`); },
            () => { console.log('Connection closed'); },
            (error) => { console.error('Connection error:', error);  }
        );

        TCPclient.onData((data) => {
            // console.log('(typeof data)',(typeof data))
             players = JSON.stringify(data)?.charAt(0)==='{'
                ? JSON.parse(data)
                : data;
            
            console.log('🟡 Current players in the lobby:', players);
        });
        // NetClient.on('data', (data) => {
        //     players = JSON.parse(data.toString());
        //     console.log('🟡 Current players in the lobby:', players);
        // })
        // NetClient.on('error', (err) => {
        //     console.error(`🚧 Error with TCP connection: ${err}`);
        //     // Handle the error, and possibly close the connection gracefully
        //     NetClient.destroy(); // Close the socket immediately to prevent unhandled error crashes
        // });
        // NetClient.on('close', () => {
        //     console.log('🏁 Connection to lobby server closed');
        // });
        // ---------- end net
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
            <div id='FormToReg'>
                <input type='text' id='usernameInput' placeholder='Enter username'>
                <br/>
                <button id='addButton'>Add Username</button>
            </div>
            <hr/>
            <div id='playerListTitile'>Players List:</div>
            <div id='playerList'>loading...</div>
            <hr/>
            <div id='MyName'></div>

            <h1>next!</h1>
            <button onclick="redirectToNext()">Go to Next Page</button>

            <script>
                function changeContent(elementId, text) {
                    var element = document.getElementById(elementId);
                    if (element) {
                        element.textContent = text;
                    } else {
                        console.log('Element for changeContent(elementId, text) not found');
                    }
                }
                const storedValue = sessionStorage.getItem('username');

                function updatePlayerList(players) {
                    const playerList = document.getElementById('playerList');
                    if (players.length>0){
                        playerList.innerHTML = players.map(player => \`<li>\${player}</li>\`).join('');
                    } else {
                        playerList.innerHTML = '[empty]';
                    }
                }
                const addUserToList = (username) => {
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
                        xhr.open('POST', '/add');
                        xhr.setRequestHeader('Content-Type', 'text/plain');
                        xhr.send('addPlayer:' + username);
                        removeForm();
                    }
                }
                console.log('storedValue',storedValue);
                if (storedValue?.length>0){
                    changeContent('MyName',('Hello '+storedValue+'!'))
                    addUserToList(storedValue);
                } else {
                    document.getElementById('addButton').addEventListener('click', (e) => {
                        const nickname = document.getElementById('usernameInput').value;
                        if (nickname) {
                            addUserToList(nickname);
                            sessionStorage.setItem('username', nickname);
                        } else {
                            console.error('Please enter a username');
                        }
                    });
                }

                function redirectToNext() {
                    window.location.href = '/next';
                }

                // if user entered username in form
                function removeForm() {
                    const formToRemove = document.getElementById('FormToReg'); // Get the element by ID
                    if (formToRemove) { // Check if the element exists before removing it
                        formToRemove.parentNode.removeChild(formToRemove);  // Remove the element from its parent node
                    } else {
                        console.log('Element of id="FormToReg" not found or already removed');
                    }
                }
                function getPlayers() {
                    const xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            const players = JSON.parse(xhr.responseText);
                            updatePlayerList(players);
                            console.log('players',players);
                        } else {
                            console.error('Error fetching players:', xhr.status);
                        }
                        }
                    };
                    xhr.open('GET', '/get');
                    xhr.send();
                }

                setInterval(getPlayers, 5000);
                // setTimeout(function () { 
                //     updatePlayerList(\`${players}\`);
                // }, 5000);
            </script>
        `);
        res.end();
    // Close the connection after receiving data
    // NetClient.end();

    }  
    // ---------------------- /add ----------------------
    else if (req.url === '/add' && req.method === 'POST' ){
        let body = '';
        req.on('data', (data) => {
            body += data.toString();
            // console.log('addPlayer:data ['+data.toString()+ ']')
            const nickname = (body.split(':'));//body.split(":"); // [ 'addPlayer', 'wert' ]
            // console.log('addPlayer:nickname',nickname)

            if (players?.length === 0 || !players.includes(nickname[1])) {
                players.push(nickname[1])
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid username');
            }

            // nickname = decodeURIComponent(body.split(':')[1]);
            // console.log('⚪️',`{"addPlayer":"${nickname[1]}"}`)
            TCPclient = new TCPClient();
            TCPclient.connect(
                NET_SERVER_PORT, // Port
                IP_ADDR, // Host
                () => { TCPclient.send(`{"addPlayer":"${nickname[1]}"}`); },
                () => {  console.log('Connection closed'); },
                (error) => {  console.error('Connection error:', error);  }
            );

            // console.log('⚪️','addPlayer:nickname2',nickname)
            TCPclient.onData((data) => {
                // console.log('🔴(typeof data)',(typeof data),JSON.stringify(data))
                players = JSON.stringify(data)?.charAt(0)==='{'
                    ? JSON.parse(data)
                    : data;
                // // const message = JSON.stringify(data)?.charAt(0)==='{'? JSON.parse(data):data;
                console.log('🟡 received ', players)
            });
        });
    } 
    // ---------------------- /get ----------------------
    else if (req.url === '/get' && req.method === 'GET' ){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const playersList = JSON.stringify(players);
        res.end(playersList);
    } 
    // ---------------------- /next ----------------------
    else if ( req.url === '/next' && req.method === 'GET') {
    //   if ((typeof NetClient)!=='string') { NetClient?.end();} // works as direct page
  
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
    //   --------------------/404 --------------------
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(HTTP_SERVER_PORT, () => {
  console.log(`Server running on port ${HTTP_SERVER_PORT}`);
});
