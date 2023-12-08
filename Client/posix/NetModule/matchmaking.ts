import dgram from 'dgram';
import * as NetStructs from './structs';
import { GameNetManager } from './game-net';

const BROADCAST_ADDRESS = '255.255.255.255';
const BROADCAST_PORT = 21348;
const BROADCAST_INTERVAL = 2500;

type JoinRequest = {
    guest: NetStructs.Player;
    gameRoomId: string;
}

/**
 * Class LanMatchmaking handles LAN matchmaking for the PONG game.
 * It supports both host and guest modes, allowing for broadcasting game rooms
 * and handling join requests.
 */
export class LanMatchmaking {
    private udpSocket: dgram.Socket;
    private player: NetStructs.Player;

    private gameRoom: NetStructs.GameRoom | null = null;

    private onFoundGameRoomCallback: OnFoundGameRoomCallback;
    private broadcastInterval: NodeJS.Timeout | null = null;

    /**
     * Constructs a new LanMatchmaking instance.
     * @param owner The player who owns this matchmaking instance.
     */
    constructor(owner: NetStructs.Player) {
        this.udpSocket = dgram.createSocket('udp4');
        this.player = owner;

        // Initialize and configure the UDP socket
        this.udpSocket.bind(BROADCAST_PORT, () => {
            this.udpSocket.setBroadcast(true);
            if (this.player.isHost) {
                this.listenAsHost();
            } else {
                this.listenAsGuest();
            }
        });

        // Start broadcasting if the player is a host
        if (this.player.isHost) {
            this.startBroadcasting(this.gameRoom);
        }
    }

    // ------------------------------------- HOST -------------------------------------

    /**
     * Broadcasts the game room information as a host.
     * @param gameRoom The game room to be broadcasted.
     */
    private broadcastRoomAsHost(gameRoom: NetStructs.GameRoom) {
        this.gameRoom = gameRoom;

        const message = Buffer.from(JSON.stringify(gameRoom));
        this.udpSocket.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDRESS, (err) => {
            if (err) console.error('Broadcast error:', err);
            else console.log('Game room broadcasted');
        });
    }

    /**
     * Starts listening for join requests as a host.
     */
    private listenAsHost() {
        // Listen for join requests
        this.udpSocket.on('message', (msg, rinfo) => {
            try {
                const joinRequest = JSON.parse(msg.toString()) as JoinRequest;
                // Check if the join request is for this game room and if the game room is not full
                if (joinRequest.gameRoomId === this.gameRoom?.id && !this.gameRoom.isFull) {
                    // Set the guest of the game room
                    this.gameRoom.setGuest(joinRequest.guest);
                    // Stop broadcasting the game room
                    this.stopBroadcasting();
                    // KICKSTART the GameNet module
                    const gameNet = new GameNetManager(this.gameRoom, true);
                }
            } catch (e) {
                console.error('Error parsing join request:', e);
            }
        });
    }

    /**
     * Starts broadcasting the game room at regular intervals.
     * @param gameRoom The game room to be broadcasted.
     */
    private startBroadcasting(gameRoom: NetStructs.GameRoom) {
        this.broadcastInterval = setInterval(() => {
            this.broadcastRoomAsHost(gameRoom);
        }, BROADCAST_INTERVAL);
    }

    /**
     * Stops broadcasting the game room.
     */
    private stopBroadcasting() {
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
            this.broadcastInterval = null;
        }
    }

    // ------------------------------------- GUEST -------------------------------------

    /**
     * Sets the callback function to be called when a game room is found.
     * @param callback The callback function.
     */
    public setOnFoundGameRoomCallback(callback: OnFoundGameRoomCallback) {
        this.onFoundGameRoomCallback = callback;
    }

    /**
     * Sends a join request as a guest to a specific game room.
     * @param gameRoomId The ID of the game room to join.
     */
    public sendJoinRequestAsGuest(gameRoomId: string) {
        const joinRequest: JoinRequest = {
            guest: this.player,
            gameRoomId: gameRoomId
        };

        const message = Buffer.from(JSON.stringify(joinRequest));
        this.udpSocket.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDRESS, (err) => {
            if (err) console.error('Join request error:', err);
            else console.log('Join request sent');
        });
    }

    /**
     * Starts listening for broadcasts of game rooms as a guest.
     */
    private listenAsGuest() {
        // Listen for broadcasts of game rooms
        this.udpSocket.on('message', (msg, rinfo) => {
            try {
                const gameRoom = JSON.parse(msg.toString()) as NetStructs.GameRoom;
                this.onFoundGameRoomCallback(gameRoom);
            } catch (e) {
                console.error('Error parsing game room info:', e);
            }
        });
    }
}

/**
 * Type definition for the callback function to be called when a game room is found.
 */
interface OnFoundGameRoomCallback {
    (gameRoom: NetStructs.GameRoom): void;
}
