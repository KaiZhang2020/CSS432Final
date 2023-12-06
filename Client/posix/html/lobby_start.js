{/* <link rel="stylesheet" href="lobbystyle.css">*/}
{/* <style>${cssContent}</style> */}

const RightSide = () => (`
<div id="right">
    <section id="title">
        <h1>Pong Game</h1>
        <h3>Play Online</h3>
    </section>
    <section id="join-game">
        <p id='Welcome'>To start or join game</p>
        <h5 id='EnterNick'>Please create username below</h5>

        <div id='FormToReg'>
            <input type='text' id='usernameInput' placeholder='Enter your nickname'>
            <button id='addButton'>Go!</button>
        </div>
    </section>
    <section id="start-game" style="display:none">
        <form action="/startGame" method="post">
            <input type="text" id="EnterHidden" name="nickname" style="display:none">
            <input type="submit" value="Start New Game">
        </form>
    </section>
    
    <div class='otherButtons'>
        <button id="Scoreboard" onclick="redirectToScoreBoard()">
            Scoreboard
        </button>
        <button id="Exit" style="display:none" onclick="userLogsOut()">
            Log out
        </button>
    </div>
</div>
`)

const EnterName = (HttpRequests) => {
return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pong Lobby</title>
</head>
<link rel="stylesheet" href="lobbystyle.css">
<body>
    <div id="left">
        <section class="leftbox">
            <h2>Active Players</h2>
            <ul class="sidelist"  id="playerList">
                <li class="listitem">
                    <p>rey</p>
                    <h6 class="is-Playing">is playing</h6>
                </li>
                <li class="listitem">
                    <p>terminator</p>
                    <h6 class="in-Lobby">in lobby</h6>
                </li>
            </ul>
        </section>
        <section class="leftbox">
            <h2>Game Rooms</h2>
            <ul class="sidelist" id="roomList">
                <li class="listitem">
                    <p>Whale room</p>
                    <button class="busy">busy</button>
                </li>
                <li class="listitem">
                    <p>Whale room</p>
                    <button class="join">join</button>
                </li>
            </ul>
        </section>
    </div>
    ${RightSide()}
    
</body>
</html>
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

    const httpRequests = new ${HttpRequests}();
    httpRequests.getStorage();


    if (storedValue?.length > 0){
        httpRequests.addUserToList(storedValue);
    } else {
        // on click 
        document.getElementById('addButton').addEventListener('click', (e) => {
            const nickname = document.getElementById('usernameInput').value;
            if (nickname) {
                sessionStorage.setItem('username', nickname);
                httpRequests.addUserToList(nickname);
            } else {
                console.error('Please enter a username');
            }
        });
    }
    const redirectToScoreBoard = () => {
        window.location.href = '/scoreboard';
    }
    const userLogsOut = () => {
        const username = sessionStorage.getItem('username'); // sessionStorage
        console.log('username@',username)
        if (username) {
            httpRequests.removeUserFromList(username);
            sessionStorage.removeItem('username');
        }
    }

    // Event listener for visibility state changes
    document.addEventListener('visibilitychange', () => {
        const username = sessionStorage.getItem('username'); // sessionStorage
        if (username) {
            httpRequests.sendVisibilityState(username,'lobby');
        } 
    });
    
    setInterval(()=> {
        httpRequests.getStorage();
        const username = sessionStorage.getItem('username'); // sessionStorage
        if (username) {
            httpRequests.sendVisibilityState(storedValue,'lobby')
        }
    }, 5000);
</script>
`
}

module.exports = EnterName;
