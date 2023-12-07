class HttpRequests {

  constructor() {}

  updatePlayerList(players) {
      const WhereIsUser = (location) => {
          return location ==='lobby'? 'in lobby':'is playing'
      }
      const playerList = document.getElementById('playerList');
      // console.log('players>>',JSON.stringify(players))
      if (players.length > 0) {
          playerList.innerHTML = players.map(player => {

          const userLocation = WhereIsUser(player.currentLocation);
          const userLocationClass = userLocation==='in lobby'? 'in-Lobby':'is-Playing';
              return (`
              <li class="listitem">
                  <p>${player.username}</p>
                  <h6 class="${userLocationClass}">${userLocation}</h6>
              </li>`)}).join('');
      } else {
          playerList.innerHTML = '[ empty list ]';
      }
  }

  updateRoomList(rooms) {
      const roomList = document.getElementById('roomList');
      // console.log('rooms>>',JSON.stringify(rooms))
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
          roomList.innerHTML = '[ empty list ]';
      }
  }

  addUserToList(username) {
    // console.log('🐯 username',username);
    if (username?.length > 0 && username!==null) {
      fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: ('addPlayer:' + username)
      })
        .then(data => {
          this.removeForm(username);
          this.getStorage();
          this.updatePlayerList(data);
        })
        .catch(error => {
          console.error('Error:',username,"|", error.message);
        });
    }
  }
  
  removeUserFromList(username) {
    if (username && username!==null) {
      fetch('/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: ('addPlayer:' + username)
      })
        .then(data => {
          this.updatePlayerList(data);
          this.restoreForm();
          this.getStorage();
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
    }
  }

  // Function to send visibility/hidden state to the server 
  sendVisibilityState(username,page) {
    const visibilityState = document.visibilityState;
    fetch('/visibility-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibilityState, username, page })
    });
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
        this.updatePlayerList(data.players);
        this.updateRoomList(data.rooms);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  }
  updateRoomData(roomID) {
    fetch('/all')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error fetching storage: ${response.status}`);
        }
      })
      .then(data => {
        const room = data?.rooms.find(room => room.roomID === roomID);
        console.log('📈data',room);
        document.querySelector('#user1 p').textContent = room.players.user1||'';
        document.querySelector('#user2 p').textContent = room.players.user2||'';
        return room;
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  }


  removeForm(uName) {
    changeContent('Welcome',('Welcome')); // < (elById, text)
    changeContent('EnterNick',(uName));
    // add to player list
    // httpRequests.addUserToList(uName);
    // start game
    document.getElementById('FormToReg').style.display = 'none';
    document.getElementById('start-game').style.display = 'block';
    document.getElementById('Exit').style.display = 'block';
    document.getElementById('EnterHidden').value = uName; // to start game value=nickname
  }
  restoreForm() {
    changeContent('Welcome',('To start or join game')); // < (elById, text)
    changeContent('EnterNick',('Please create username below'));

    // start over
    document.getElementById('FormToReg').style.display = 'block';
    document.getElementById('start-game').style.display = 'none';
    document.getElementById('Exit').style.display = 'none';
    document.getElementById('EnterHidden').value = ''; // to start game value=nickname
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