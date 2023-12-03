const net = require('net');
const http = require('http');
// const NetClient = new net.Socket();

let NetClient = ""// net.createServer();
// const sockets = [];
let players = [];
let id = 0; 
let username = '🦊 New player!'

const NET_SERVER_PORT  = 3001;
const HTTP_SERVER_PORT = 3000;
const IP_ADDR          = 'localhost';

function broadcast(message) {
  NetClient.forEach(socket => {
    socket.write(message);
  });
}
// ---------------------------------------
const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {

    NetClient = new net.Socket();
    NetClient.connect(NET_SERVER_PORT, IP_ADDR, () => {
      console.log('Connected to lobby server');
      NetClient.write(username); // from localhost
      // console.log('NetClient ->connect-> write:',username);
    });
    NetClient.on('data', (data) => {
      players = JSON.parse(data.toString());
      console.log('🟡 Current players in the lobby2:', players, 'data:',data);
    })
    NetClient.on('error', (err) => {
      console.error(`🚧 Error with TCP connection: ${err}`);
      // Handle the error, and possibly close the connection gracefully
      NetClient.destroy(); // Close the socket immediately to prevent unhandled error crashes
    });
    NetClient.on('close', () => {
      console.log('🏁 Connection to lobby server closed');
    });
    // ----------------------------------------

  // Close the connection after receiving data
  // NetClient.end();
  
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
              xhr.open('POST', '/addPlayer');
              xhr.setRequestHeader('Content-Type', 'text/plain');
              xhr.send('addPlayer' + username);
              removeForm();
            }
          }
          console.log('storedValue',storedValue);
          if (storedValue?.length>0){
            changeContent('MyName',('Hello '+storedValue+'!'))
            addUserToList(storedValue);
          } else {
              document.getElementById('addButton').addEventListener('click', (e) => {
                username = document.getElementById('usernameInput').value;
                if (username) {
                  addUserToList(username);
                  sessionStorage.setItem('username', username);
                } else {
                  console.error('Please enter a username');
                }
              });
          }

        function redirectToNext() {
          window.location.href = '/next';
        }
        function updatePlayerList(players) {
          const playerList = document.getElementById('playerList');
          playerList.innerHTML = players.map(player => \`<li>\${player}</li>\`).join('');
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
                console.log('players',players)
              } else {
                console.error('Error fetching players:', xhr.status);
              }
            }
          };
          xhr.open('GET', '/players');
          xhr.send();
        }

        setInterval(getPlayers, 5000);
        getPlayers();
      </script>
    `);
    res.end();

  }  else if (req.method === 'GET' && req.url === '/next') {
    // console.log('NetClient',typeof (NetClient))
    if ((typeof NetClient)!==undefined) { NetClient?.end();} // works as direct page
    // NetClient.on('data', (data) => {
    //   players = JSON.parse(data.toString());
    //   console.log('🟡 Current players in the lobby2:', players, 'data:',data);
    // })
    // Handle redirection after button click
    res.writeHead(200, { 'Location': '/next','Content-Type': 'text/html' });
    res.write(`
      <h1>This is next</h1>
      <button onclick="redirectToNext()">Go to Main Page</button>
      <script>

      function redirectToNext() {
        window.location.href = '/';
      }
      </script>
    `);
    res.end();
  
  } else if (req.method === 'GET' && req.url === '/players') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const playersList = JSON.stringify(players.map(player => player.username));
    res.end(playersList);
    
  } else if (req.method === 'POST' && req.url === '/addPlayer') {
    let body = '';
    // NetClient.write()
    // NetClient.on('data', (data) => {
    //   // NetClient.write(username);
    //   players = JSON.parse(data.toString());
    //   console.log('🟡Current players in the lobby1:', players);
    // })
    req.on('data', (data) => {
      body += data.toString();
      console.log('addPlayer data ['+data.toString()+ '] - ', username)
      // NetClient.write(username);
    });
    req.on('end', () => {
      const username = body.slice(9); // Remove 'addPlayer:' prefix
      console.log('🥶 end username',username)
      if (username) {
        if (!players.includes(username)) {
          players.push({ username });
          const playersList = JSON.stringify(players.map(player => player.username));
          broadcast(playersList);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(playersList);
          // array.push(newValue);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid username');
      }
    });

  } else { 
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found!!!');
  }
});
  
httpServer.listen(HTTP_SERVER_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_SERVER_PORT}`);
});
