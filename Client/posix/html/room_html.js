// <script src="./game/game.js" type="module"></script>
// <link rel="stylesheet" href="game.css">
const RoomHTML = (roomID,user1,user2,HttpRequests) =>
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Session</title>
    
</head>
<body>
    <div class="score">
        <div id='user1'>
            <p>${user1}</p>
            <h2 id="player-one-score">0</h2>
        </div>
        <div id='user2'>
            <p>${user2}</p>
            <h2 id="player-two-score">0</h2>
        </div>
    </div>
    <div class="ball" id="ball"></div>
    <div class="paddle" id="player-one-paddle"></div>
    <div class="paddle" id="player-two-paddle"></div>

    <script>
        class Ball {
            constructor(ballElem) {
                this.ballElem = ballElem
            }
            get x() { return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x")) }

            set x(val) { this.ballElem.style.setProperty("--x", val) }

            get y() { return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y")) }

            set y(val) { this.ballElem.style.setProperty("--y", val) }
            update(delta) {}
        }
        const ball = new Ball(document.getElementById("ball"))
        function update(time) {
            window.requestAnimationFrame(update)
        }
        window.requestAnimationFrame(update)
        // ------------ 

        if (\`${user1}\`==='undefined'&&\`${user2}\`==='undefined'){ // redirect to /lobby if no user1
            window.location.href = '/';
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

        const httpRequests = new ${HttpRequests}();
        document.addEventListener('visibilitychange', () => {
            // const username = sessionStorage.getItem('username'); // sessionStorage
            if (storedValue) {
                httpRequests.sendVisibilityState(storedValue,'room');
                console.log(storedValue,'VISISBLE')
            } else {
                console.log(storedValue,'INVISISBLE')
            }
        });

        setInterval(()=> {
            httpRequests.updateRoomData("${roomID}");
        }, 3000);
    </script>
</body>
<style>
    *, *::after, *::before {
        box-sizing: border-box;
    }
    
    body {
        margin: 0;
        background-color: #191A1C;
    }

    body:after {
        content: '';
        height: 100%;
        width: 0px;
        border: 2px dashed #ffffff0f;
        position: absolute;
        left: calc(50% - 2px);
        top: 0;
        z-index: -1;
    }

    h2 {
        color: #fff;
        opacity: 0.4;
        font-weight: 100;
        margin: 0;
    }
    
    .paddle {
        --position:50;
        top: calc(var(--position) * 1vh);
        position: absolute;
        background-color: #26AEDE;
        width: 2vh;
        height: 15vh;
        border-radius: 3px;
    }
    
    #player-one-paddle {
        left: 1vw;
        margin-left: 20px;
    }
    
    #player-two-paddle {
        right: 1vw;
        margin-right: 20px;
    }
    
    .ball {
        --x: 50;
        --y: 50;
    
        --position: absolute;
        left: calc(var(--x) * 1vw - 8px);
        top: calc(var(--y) * 1vh);
        position: absolute;
        border-radius: 50%;
        background-color: #26AEDE;
        width: 2.5vh;
        height: 2.5vh;
    }
    
    .score {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        font-size: 45px;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    }
    .score > div {
        margin: 0 40px;
        display: flex;
        flex-direction: column;
        max-width: 100px;
        align-items: center;
        justify-content: flex-end;
    }
    .score p {
        font-size: 17px;
        padding: 0;
        color: #fff;
        opacity: 0.4;
        font-weight: 300;
        margin-bottom: -5px;
    }
    
    .score > * {
        padding: 10px;
        flex-grow: 1;
        flex-basis: 0;
        opacity: 50%;
    }
    
    .score > :first-child{
        text-align: right;
    }</style>
</html>
`


module.exports = RoomHTML;
