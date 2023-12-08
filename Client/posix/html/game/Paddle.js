export default class Paddle {
    constructor(paddleElm) {
        this.paddleElm = paddleElm
    }

    get position() {
        return parseFloat(getComputedStyle(this.paddleElm).getPropertyValue("--position"))
    }

    set position(val) {
        this.paddleElm.style.setProperty("--position", val)
    }

    rect() {
        return this.paddleElm.getBoundingClientRect()
    }

    reset() {
        this.position = 50
    }
}