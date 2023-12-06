class HttpRequests {

    constructor() {
        this.players = [];
        this.rooms = [];
    }

    updatePlayerList(players) {
        const WhereIsUser = (location) => {
            return location ==='lobby'? 'in lobby':'is playing'
        }
        const playerList = document.getElementById('playerList');
        console.log('players>>',JSON.stringify(players))
        if (players.length > 0) {
            playerList.innerHTML = players.map(player => {

            const userLocation = WhereIsUser(player.currentLocation);
            const userLocationClass = userLocation==='in lobby'? 'in-Lobby':'is-Playing';
                return (`<li class="listitem">
                    <p>${player.username}</p>
                    <h6 class="${userLocationClass}">${userLocation}</h6>
                </li>`)}).join('');
        } else {
            playerList.innerHTML = '[empty]';
        }
    }

    updateRoomList(rooms) {
        const roomList = document.getElementById('roomList');
        // console.log('rooms>>',rooms)
        const roomNames = ['🐳 Whale room', '🦐 Shrimp room', '🐯 Tiger Room', '🛸 Space room', '🤡 Crazy room', '🧸 Bear room','👻 Creepy room','👹 Dark room','😇 Honest room','🏆 Last room'];
        if (rooms.length > 0) {
            roomList.innerHTML = rooms.map((room,idx) => 
            `<li class="listitem">
                <p>${roomNames[idx%10]}</p>
                ${room.playerCounter == 2 
                    ? '<button class="busy">busy</button>' 
                    : '<button class="join">join</button>'
                }
            </li>`).join('');
        } else {
            roomList.innerHTML = '[empty]';
        }
    }
    // Function to send visibility/hidden state to the server 
    sendVisibilityState(username,page) {
        const visibilityState = document.visibilityState;
        // const username = sessionStorage.getItem('username'); // sessionStorage
        fetch('/visibility-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visibilityState, username, page })
        });
        // console.log({ visibilityState, username, page: 'lobby' })
        if (visibilityState=='visible'){
            // this.addUserToList(username);
            console.log('ADD',username)
        } else {
            console.log('REMOVE')
        }
    }

    addUserToList(username) {
        if (username) {
          fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: ('addPlayer:' + username)
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error(`Error adding player: ${response.status}`);
              }
            })
            .then(data => {
              // Assuming response contains updated player list
              this.updatePlayerList(data);
            //   this.sendVisibilityState(username);
            })
            .catch(error => {
              console.error('Error:', error.message);
            });
      
          this.removeForm();
          // this.getPlayers();
          this.getStorage();
        }
    }
    
    getPlayers() {
        fetch('/get')
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`Error fetching players: ${response.status}`);
            }
          })
          .then(data => {
            // console.log('Response from /get:', data);
            this.updatePlayerList(data);
          })
          .catch(error => {
            console.error('Error:', error.message);
          });
    }
    
    getStorage() {
        fetch('/all')
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`Error fetching storage: ${response.status}`);
            }
          })
          .then(data => {
            // console.log('Response from /all:', data);
            this.updatePlayerList(data.players);
            this.updateRoomList(data.rooms);
          })
          .catch(error => {
            console.error('Error:', error.message);
          });
    }
  
    removeForm() {
        const formToRemove = document.getElementById('FormToReg');
        if (formToRemove) {
            formToRemove.parentNode.removeChild(formToRemove);
        } else {
            console.log('Element of id="FormToReg" not found or already removed');
        }
    }
  }
  
  // Usage
//   const httpRequests = new HttpRequests();
//   const storedValue = sessionStorage.getItem('username');
  
//   if (storedValue?.length > 0) {
//     changeContent('MyName', ('Hello ' + storedValue + '!'));
//     httpRequests.addUserToList(storedValue);
//   } else {
//     document.getElementById('addButton').addEventListener('click', (e) => {
//       const nickname = document.getElementById('usernameInput').value;
//       if (nickname) {
//         httpRequests.addUserToList(nickname);
//         sessionStorage.setItem('username', nickname);
//       } else {
//         console.error('Please enter a username');
//       }
//     });
//   }
  
//   function redirectToNext() {
//     window.location.href = '/next';
//   }
  
//   setInterval(() => httpRequests.getPlayers(), 3000);
  
module.exports = HttpRequests;
