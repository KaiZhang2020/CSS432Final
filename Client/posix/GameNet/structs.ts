/**
 * Type definition for a network address with IP and port.
 */
type NetAddr = {
    ip: string;
    port: number;
}

/**
 * Represents a player in the game.
 */
class Player {
    /** Unique identifier - username of the player */
    readonly username: string;
    
    /** Unique identifier - numeric id of the player */
    readonly id: number;
    
    /** Network address of the player including IP and port */
    addr: NetAddr;
    
    /** Indicates if the player is the host of the game room */
    isHost: boolean;
    
    /** Current score of the player */
    score: number;
    
    /** Current Y-axis position of the player */
    position: number;

    /**
     * Constructs a new player instance.
     * @param {string} username - The username of the player.
     * @param {number} id - The unique identifier for the player.
     * @param {NetAddr} addr - The network address of the player.
     * @param {boolean} isHost - Flag indicating if the player is the host.
     */
    constructor(username: string, id: number, addr: NetAddr, isHost: boolean) {
        this.username = username;
        this.id = id;
        this.addr = addr;
        this.isHost = isHost;
    }

    /**
     * Sets the score for the player.
     * @param {number} score - The new score to be set for the player.
     */
    setScore(score: number) {
        this.score = score;
    }
}

/**
 * Represents a game room that holds the players and game status.
 */
class GameRoom {
    /** Unique identifier of the game room */
    id: string;
    
    /** The host player of the game room */
    host: Player;
    
    /** The guest player of the game room */
    guest: Player;
    
    /** Flag indicating if the game room is full */
    isFull: boolean;

    /**
     * Constructs a new game room instance.
     * @param {Player} host - The player who will act as the host of the game room.
     * @param {string} id - The unique identifier for the game room.
     */
    constructor(host: Player, id: string) {
        this.host = host;
        this.id = id;
        this.isFull = false;
    }

    /**
     * Sets the guest player for the game room and marks the room as full.
     * @param {Player} guest - The player to be set as the guest of the game room.
     */
    setGuest(guest: Player) {
        this.guest = guest;
        this.isFull = true;
    }
}

/**
 * Type definition for a 2D position with x and y coordinates.
 */
type Position = {
    x: number;
    y: number;
}

/**
 * Class that holds updates of the game such as score and position.
 */
class GameInfo {
    /** Score of the host player */
    hostScore: number;
    
    /** Score of the guest player */
    guestScore: number;
    
    /** Y-axis position of the host player */
    hostPosition: number;
    
    /** Y-axis position of the guest player */
    guestPosition: number;
    
    /** Current position of the ball in the game */
    ballPosition: Position;

    /**
     * Constructs a new GameInfo instance.
     * @param {number} hostScore - The score of the host player.
     * @param {number} guestScore - The score of the guest player.
     * @param {number} hostPosition - The Y-axis position of the host player.
     * @param {number} guestPosition - The Y-axis position of the guest player.
     * @param {Position} ballPosition - The current position of the ball.
     */
    constructor(hostScore: number, guestScore: number, hostPosition: number, guestPosition: number, ballPosition: Position) {
        this.hostScore = hostScore;
        this.guestScore = guestScore;
        this.hostPosition = hostPosition;
        this.guestPosition = guestPosition;
        this.ballPosition = ballPosition;
    }
}

/**
 * Enum for control directions in the game.
 */
enum ControlDirection {
    UP,
    DOWN
}
