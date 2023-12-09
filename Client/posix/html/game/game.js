import Ball from './Ball.js'
import Paddle from './Paddle.js'

const ball = new Ball(document.getElementById("ball"))
const hostPaddle = new Paddle(document.getElementById("Host-paddle"))
const guestPaddle = new Paddle(document.getElementById("Guest-paddle"))
const HostScore = document.getElementById("Host-score")
const GuestScore = document.getElementById("Guest-score")

let lastTime

export default class GameInterface {
    constructor() {
        window.requestAnimationFrame(update)
    }

    getGuestPosition(position) {
        guestPaddle.position = position
    }

    sendPositionData() {
        return hostPaddle.position
    }

    update(time) {
        if (lastTime != null) {
            if ((parseInt(GuestScore.textContent) + parseInt(HostScore.textContent)) >= 5) {
                //game over
            }
            //update
            const delta = time - lastTime
            ball.update(delta, [hostPaddle, guestPaddle])

            isOver()
        }
        lastTime = time
        window.requestAnimationFrame(update)
    }
}







document.addEventListener("mousemove", e => {
    hostPaddle.position = (e.y / window.innerHeight) * 100
})



function isOver() {
    const rect = ball.rect
    if (rect.right >= window.innerWidth) {
        HostWin()
    } else if (rect.left <= 0) {
        GuestWin()
    }
    ball.reset()
}

function HostWin() {
    HostScore.textContent = parseInt(HostScore.textContent) + 1
}

function GuestWin() {
    GuestScore.textContent = parseInt(GuestScore.textContent) + 1
}