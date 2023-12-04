type NetAddr = {
    ip: string
    port: number
}

class Player {
    // Unique identifiers
    readonly username: string;
    readonly id: number;
    // Network
    addr: NetAddr; // ipv4 addresss with the port
    // Game
    isHost: boolean; // whether is player os the host of the room or not
    score: number; // current score of the player
    position: number; // current position -- only Y axis

    constructor(username: string, id: number, addr: NetAddr, isHost: boolean) {
        this.username = username;
        this.id = id;
        this.addr = addr;
        this.isHost = isHost;
    }

    setScore(score: number) {
        this.score = score;
    }
}

class GameRoom {
    id: string
    host: Player;
    guest: Player;
    isFull: boolean;

    constructor(host: Player) {
        this.host = host;
        this.isFull = false;
    }

    setGuest(guest: Player) {
        this.guest = guest;
        this.isFull = true;
    }
}

// xy coordinates
type Position = {
    x: number;
    y: number;
}

// class that holds updates of the game (score, position, etc.)
class GameInfo {
    // scores
    hostScore: number;
    guestScore: number;
    // positions
    hostPosition: number;
    guestPosition: number;
    ballPosition: Position;

    constructor(hostScore: number, guestScore: number, hostPosition: number, guestPosition: number, ballPosition: Position) {
        this.hostScore = hostScore;
        this.guestScore = guestScore;
        this.hostPosition = hostPosition;
        this.guestPosition = guestPosition;
        this.ballPosition = ballPosition;
    }
}

enum ControlDirection {
    UP,
    DOWN
}