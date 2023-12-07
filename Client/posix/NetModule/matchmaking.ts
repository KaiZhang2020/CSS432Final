import dgram from 'dgram';
import * as NetStructs from './structs';

const BROADCAST_ADDRESS = '255.255.255.255';
const BROADCAST_PORT = 21348;

type JoinRequest = {
    guest: NetStructs.Player;
    gameRoomId: string;
}

export class LanMatchmaking {
    private udpSocket: dgram.Socket;
    private player: NetStructs.Player;

    private onFoundGameRoomCallback: OnFoundGameRoomCallback;
    private broadcastInterval: NodeJS.Timeout | null = null;

    constructor(owner: NetStructs.Player) {
        this.udpSocket = dgram.createSocket('udp4');
        this.player = owner;

        this.udpSocket.bind(BROADCAST_PORT, () => {
            this.udpSocket.setBroadcast(true);
            if (this.player.isHost) {
                this.listenAsHost();
            } else {
                this.listenAsGuest();
            }
        });

        this.udpSocket.on('message', (msg, rinfo) => {
            // General message handling logic here
        });
    }

    // ------------------------------------- HOST -------------------------------------

    public broadcastRoomAsHost(gameRoom: NetStructs.GameRoom) {
        const message = Buffer.from(JSON.stringify(gameRoom));
        this.udpSocket.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDRESS, (err) => {
            if (err) console.error('Broadcast error:', err);
            else console.log('Game room broadcasted');
        });
    }

    private listenAsHost() {
        // Listen for join requests
        this.udpSocket.on('message', (msg, rinfo) => {
            try {
                const joinRequest = JSON.parse(msg.toString()) as JoinRequest;
                // Process the join request
            } catch (e) {
                console.error('Error parsing join request:', e);
            }
        });
    }

    private startBroadcasting(gameRoom: NetStructs.GameRoom) {
        this.broadcastInterval = setInterval(() => {
            this.broadcastRoomAsHost(gameRoom);
        }, 5000);
    }

    private stopBroadcasting() {
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
            this.broadcastInterval = null;
        }
    }

    // ------------------------------------- GUEST -------------------------------------

    public setOnFoundGameRoomCallback(callback: OnFoundGameRoomCallback) {
        this.onFoundGameRoomCallback = callback;
    }

    private sendJoinRequestAsGuest(gameRoomId: string) {
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

interface OnFoundGameRoomCallback {
    (gameRoom: NetStructs.GameRoom): void;
}