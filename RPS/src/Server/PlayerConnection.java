import java.io.*;
import java.net.Socket;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * The PlayerConnection class manages a connection with a client in a server.
 * It handles reading and writing messages to the client over a socket.
 */
public class PlayerConnection {
    private Socket socket;
    private DataInputStream in;
    private DataOutputStream out;
    private String name;
    private int score;
    private boolean ingame;
    private AtomicBoolean alive = new AtomicBoolean(true);

    /**
     * Constructs a new PlayerConnection using a given client socket.
     * Initializes input and output streams for communication and reads the client's name.
     *
     * @param client The client socket for this connection.
     * @throws IOException If an I/O error occurs when creating the input and output streams.
     */
    public PlayerConnection(Socket client) throws IOException {
        this.socket = client;

        try {
            this.in = new DataInputStream(client.getInputStream());
            this.out = new DataOutputStream(client.getOutputStream());
            this.name = in.readUTF();
        } catch (IOException e) {
            try {
                client.close();
            } catch (IOException ex) {
                // Log exception
            }
            throw e; // Rethrow the original exception
        }
    }

    /**
     * Gets the client's name.
     */
    public String getName() {
        return name;
    }

    /**
     * Gets the client's score.
     */
    public int getScore() {
        return score;
    }

    /**
     * Increments the client's score by 1.
     */
    public void incrementScore() {
        score++;
    }

    /**
     * Reads a message from the client. This method checks if a message is available
     * and then reads it, returning the client's name and the message.
     *
     * @return The read message prefixed with the client's name, or null if no message is available.
     */
    public String readMessage() {
        try {
            if (in.available() > 0) {
                String message = in.readUTF();
                return name + ": " + message;
            }
        } catch (IOException e) {
            alive.set(false);
            // Log exception
        }
        return null;
    }

    /**
     * Writes a message to the client.
     *
     * @param message The message to be sent to the client.
     */
    public void writeMessage(String message) {
        try {
            out.writeUTF(message);
            out.flush();
        } catch (IOException e) {
            alive.set(false);
            // Log exception
        }
    }

    /**
     * Checks if the connection to the client is still alive.
     *
     * @return true if the connection is alive, false otherwise.
     */
    public boolean isAlive() {
        return alive.get();
    }

    /**
     * Checks if the client is in a game.
     * @return true if the client is in a game, false otherwise.
     */
    public boolean isIngame() {
        return ingame;
    }

    /**
     * Sets the client's ingame status.
     * @param ingame true if the client is in a game, false otherwise.
     */
    public void setIngame(boolean ingame) {
        this.ingame = ingame;
    }
}