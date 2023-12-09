import * as net from 'net';
import * as NetStructs from './structs';
import * as GameInterface from '../html/game/game';

/**
 * Manages the network aspect of the Pong game, handling both host and guest roles.
 */
export class GameNetManager {
    private socket: net.Socket;
    readonly gameRoom: NetStructs.GameRoom;
    readonly isHost: boolean;

    private uiConnection: any;

    /**
     * Constructor for GameNetManager.
     * 
     * @param gameRoom The game room associated with this network manager.
     * @param isHost A boolean indicating if this instance is for the host or the guest.
     */
    constructor(gameRoom: NetStructs.GameRoom, isHost: boolean) {
        this.gameRoom = gameRoom;
        this.isHost = isHost;

        if (isHost) {
            this.startGameAsHost();
        } else {
            this.joinGameAsGuest();
        }
    }

    // ------------------------------------- HOST -------------------------------------

    /**
     * Initializes the game as the host. Sets up a TCP server to wait for guest connection.
     * Calls the setupSocketListeners method once a guest connects.
     */
    private startGameAsHost() {
        const server = net.createServer((socket) => {
            // Check if the game room is full
            if (this.gameRoom.isFull) {
                // TODO: Send a message to the guest that the game room is full
                console.log('Game room is full');
                socket.destroy();
                return;
            }
            // Setup socket listeners
            this.socket = socket;
            this.setupSocketListeners();
            console.log('Guest connected!');

            // TODO: Call the INTERFACE method to start the game
            // const uiConnection = UI.startGame(this);
            // this.uiConnection = uiConnection;
        });

        server.listen(this.gameRoom.host.addr.port, this.gameRoom.host.addr.ip, () => {
            console.log('Waiting for guest to connect...');
        });
    }

    /**
     * Processes incoming data from the socket as the host.
     * The host always will receive data as a netStructs.ControlDirection object.
     * @param data The data received from the guest.
     */
    private processIncomingDataAsHost(data: Buffer) {
        // Read from the buffer and convert to a netStructs.ControlDirection object
        const controlDirection = JSON.parse(data.toString()) as NetStructs.ControlDirection;
        switch (controlDirection) {
            case NetStructs.ControlDirection.UP:
                // TODO: Call the INTERFACE method to move the guest's paddle up
                // uiConnection.moveGuestPaddleUp();
                break;
            case NetStructs.ControlDirection.DOWN:
                // TODO: Call the INTERFACE method to move the guest's paddle down
                // uiConnection.moveGuestPaddleDown();
                break;
        }
    }

    /**
     * Sends game data over the network to the guest.
     * @param gameData The game data to be sent.
     */
    public sendGameDataAsHost(gameData: NetStructs.GameInfo) {
        const serializedData = JSON.stringify(gameData);
        this.socket.write(serializedData);
    }

    // ------------------------------------- GUEST -------------------------------------

    /**
     * Initializes the game as the guest. Connects to the host's TCP server.
     * Calls the setupSocketListeners method once connected.
     */
    private joinGameAsGuest() {
        this.socket = net.createConnection(this.gameRoom.host.addr.port, this.gameRoom.host.addr.ip, () => {
            console.log('Connected to host!');
            // Setup socket listeners and wait for data
            this.setupSocketListeners();
        });
    }

    /**
     * Processes incoming data from the socket as the guest.
     * @param data The data received from the host. This should always be of type netStructs.GameInfo.
     */
    private processIncomingDataAsGuest(data: Buffer) {
        // Read from the buffer and convert to a netStructs.GameInfo object
        const gameInfo = JSON.parse(data.toString()) as NetStructs.GameInfo;
        // TODO: Call the INTERFACE method to update the game
        // uiConnection.updateGame(gameInfo);
    }

    /**
     * Sends game data over the network to the host.
     * @param gameData The game data to be sent.
     */
    public sendGameDataAsGuest(gameData: NetStructs.ControlDirection) {
        const serializedData = JSON.stringify(gameData);
        this.socket.write(serializedData);
    }

    // ------------------------------------- SHARED -------------------------------------

    /**
     * Sets up listeners for various socket events including data reception, socket closing, and errors.
     */
    private setupSocketListeners() {
        this.socket.on('data', (data) => {
            this.processIncomingData(data);
        });

        this.socket.on('close', () => {
            console.log('Connection closed');
            // TODO: Logic for handling disconnection can be added here
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            // TODO: Logic for handling socket errors can be added here
        });
    }

    /**
     * Processes incoming data from the socket. This method should be overridden with game-specific logic.
     * 
     * @param data The data received from the socket.
     */
    private processIncomingData(data: Buffer) {
        if (this.isHost) {
            this.processIncomingDataAsHost(data);
        } else {
            this.processIncomingDataAsGuest(data);
        }
    }
}
