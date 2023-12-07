// 9)  Implement a scoreboard.  

// This would keep a record of who has the most points or wins 
// (or whatever your metric for scoring is). 
// If you implement your game as a P2P games, you should use your 
// bootstrap server as scoreboard server (a distributed scoreboard 
// would be great, but it is beyond the scope of the course, so unless 
// you're really motivated to do so, you can take the more centralized 
// and simpler approach).  The scoreboard should be persistent across 
// all games (you can back it up to a file regularly on the server so 
// if your server crashes, it can automatically reload it from the disk 
// the next time it restarts).
const ScoreBoardHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scoreboard</title>
    <link rel="stylesheet" href="scoreboard.css">
</head>
<body>
    <h3>Pong Game</h3>
    <h1>Top 15</h1>
    <section id="list">
        <section class="list-item">
            <p class="left">rey</p>
            <p class="green">100:10</p>
            <p class="right">terminator</p>
        </section>
        <section class="list-item">
            <p class="left">rey</p>
            <p class="green">100:10</p>
            <p class="right">terminator</p>
        </section>
        <section class="list-item">
            <p class="left">rey</p>
            <p class="green">100:10</p>
            <p class="right">terminator</p>
        </section>
        <section class="list-item">
            <p class="left">gameMonsterrrrrrrrr</p>
            <p class="yellow">80:10</p>
            <p class="right">terminator</p>
        </section>
        <section class="list-item">
            <p class="left">gameMonster</p>
            <p class="yellow">80:10</p>
            <p class="right">terminator</p>
        </section>
        <section class="list-item">
            <p class="left">gameMonster</p>
            <p class="yellow">80:10</p>
            <p class="right">rey</p>
        </section>
        <section class="list-item">
            <p class="left">rey</p>
            <p class="red">80:10</p>
            <p class="right">terminator</p>
        </section>
    </section>
    <button onclick="redirectToMainPage()">Go to lobby</button>
</body>
</html>
<script>
    const redirectToMainPage = () => {
        window.location.href = '/';
    }
</script>
`
}

module.exports = ScoreBoardHTML;