type NetAddr = {
    address: string
    port: number
}

class Player {
    // Unique identifiers
    readonly username: string;
    readonly id: number;
    // Network
    addr: NetAddr; // ipv4 addresss with the port
    // Game
    is_host: boolean; // whether is player os the host of the room or not
    score: number; // current score of the player
    position: number; // current position -- only Y axis

    constructor(username: string, id: number, addr: NetAddr, is_host: boolean) {
        this.username = username;
        this.id = id;
        this.addr = addr;
        this.is_host = is_host;
    }

    setScore(score: number) {
        this.score = score;
    }
}

class GameRoom {
    id: string
    host: Player;
    guest: Player;
    is_full: boolean;

    constructor(host: Player) {
        this.host = host;
        this.is_full = false;
    }

    setGuest(guest: Player) {
        this.guest = guest;
        this.is_full = true;
    }
}