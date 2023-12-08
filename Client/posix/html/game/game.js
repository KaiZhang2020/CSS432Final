import Ball from './Ball.js'
import Paddle from './Paddle.js'

const ball = new Ball(document.getElementById("ball"))
const hostPaddle = new Paddle(document.getElementById("Host-paddle"))
const guestPaddle = new Paddle(document.getElementById("Guest-paddle"))
const HostScore = document.getElementById("Host-score")
const GuestScore = document.getElementById("Guest-score")

let lastTime

function update(time) {
    if (lastTime != null) {
        //update
        if (isOver()) {

        }
    }
    lastTime = time
    window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

document.addEventListener("mousemove", e => {
    hostPaddle.position = (e.y / window.innerHeight) * 100
    sendPosition(hostPaddle.position)
})

function sendPosition(position) {

}

function isOver() {
    if (rect.right >= window.innerWidth) {
        HostWin()
    } else if (rect.left <= 0) {
        GuestWin()
    }
}

function HostWin() {
    HostScore.textContent = parseInt(HostScore.textContent) + 1
}

function GuestWin() {
    GuestScore.textContent = parseInt(GuestScore.textContent) + 1
}