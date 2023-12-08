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

    rect() {
        return this.ballElem.getBounds()
    }

    update(delta) {
        this.x += this.direction.x * this.velocity * delta
        this.y += this.direction.y * this.velocity * delta
        const rect = this.rect()
        this.velocity += delta * 0.00001
        if (rect.bottom >= window.innerHeight || rect.top <= 0) {
            this.direction.y *= -1
        }

        if (rect.right >= window.innerWidth || rect.left <= 0) {
            this.direction.x *= -1
        }
    }

    reset() {
        this.x = 50;
        this.y = 50;
        this.direction = { x: 0 }
        while (this.direction.x <= .2 || this.direction.x >= .9) {
            const heading = randomNumGen(0, 2 * Math.PI)
            this.direction = { x: Math.cos(heading), y: Math.sin(heading) }
        }
        this.velocity = 0.025
    }
}


function randomNumGen(min, max) {
    return Math.random() * (max - min) + min
}