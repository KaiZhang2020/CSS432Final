export default class Ball {
    constructor(ballElem) {
        this.ballElem = ballElem
    }
    get x() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"))
    }

    set x(val) {
        this.ballElem.style.setProperty("--x", val)
    }

    get y() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"))
    }

    set y(val) {
        this.ballElem.style.setProperty("--y", val)
    }
    update(delta) {}
}