import java.net.*;          // for Socket and ServerSocket
import java.io.*;           // for IOException
import java.util.*;         // for Vector

public class Server {
    // A list of all the client connections to the server
    private static ArrayList<PlayerConnection> connections = new ArrayList<PlayerConnection>();
    
    // A list of all the games
    private static ArrayList<GameRoom> games = new ArrayList<GameRoom>();
    private static final int MAX_GAMES = 4;

    /**
     * Creates a server socket with a given port, and thereafter goes into
     * an infinite loop where:
     * <ol>
     * <li> Accept a new connection if there is one.
     * <li> Add this connection into a list of existing connections
     * <li> For each connection, run the lobby and game logic.
     * <li> Delete the connection if it is already disconnected.
     * </ol>
     *
     * @param port an IP port
     */
    public Server(int port) {
        // Initialize the list of games
        initializeGameRooms();

        try (ServerSocket server = new ServerSocket(port)){
            while (true) {
                try {
                    server.setSoTimeout(500); // Will be blocked for 500ms upon accept
                    Socket client = server.accept(); // Accept a new connection
                    if(client == null){
                        continue;
                    }else{
                        // Add the new connection into a list of existing connections
                        PlayerConnection conn = new PlayerConnection(client);
                        connections.add(conn);
                        System.out.println("Added connection: " + conn.getName());

                        conn.writeMessage(generateLandingMessage(conn));
                    }
                } catch (SocketTimeoutException e) {
                    // Handle timeout exception if needed
                }
                
                // Read a new message from the connection
                for (PlayerConnection player:connections) {
                    String message = player.readMessage();
                    parseLobbyMessage(player, message);
                }
            }
            // Note: server.close(); is not called, as the loop is infinite
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Generate a landing message for the player.
     * @param conn The player connection.
     * @return A string containing the landing message.
     */
    private String generateLandingMessage(PlayerConnection conn) {
        String landingMsg = "Welcome " + conn.getName() + "!\nPlease choose a game to join\n";
        // Display the number of players in each room
        for (int i = 1; i < games.size(); i++) {
            landingMsg += "Room " + i + ": " + games.get(i).getNumPlayers() + " players\n";
        }
        // Display the list of connected players
        landingMsg += "\nHere is a list of connected players:\n";
        for(int i = 0; i < connections.size(); i++){
            landingMsg += "   + " + connections.get(i).getName() + "\n";
        }
        // Tell the user what to do
        landingMsg += "\nType the room number to join a game, 0 to see the scoreboard, or -1 to quit.\n\n";

        return landingMsg;
    }

    /**
     * Generate a scoreboard of all the players. It is sorted by score.
     * @return A string containing the scoreboard.
     */
    private static String generateScoreBoard() {
        ArrayList<PlayerConnection> sortedConnections = new ArrayList<>(connections);
        Collections.sort(sortedConnections, new PlayerScoreComparator());
        String toSend = "";
        for(PlayerConnection conn: sortedConnections){
            toSend += "Player: " + conn.getName()+ ": " + conn.getScore() + "\n";
        }
        return toSend;
    }

    /**
     * Initialize the list of games
     */
    private static void initializeGameRooms() {
        for (int i = 0; i < MAX_GAMES; i++) {
            games.add(new GameRoom("Room " + i));
        }
    }

    /**
     * Parse the message from the lobby.
     * @param player The player who sent the message.
     * @param message The message sent by the player.
     */
    private static void parseLobbyMessage(PlayerConnection player, String message) {
        // Check if the message is a number
        boolean isMsgChat = false;

        // Read a new message from the connection
        if (message == null) {
            return;
        } else {
            // Try to convert the message to an integer
            try {
                int roomMsg = Integer.parseInt(message);
                if (roomMsg >= 1 && roomMsg < MAX_GAMES) {
                    // Add the player to the game
                    games.get(roomMsg).addPlayer(player);
                    System.out.println("Player added in room " + roomMsg);
                } else if (roomMsg == -1) {
                    // Quit the game
                    player.writeMessage("You may close your console safely");
                    System.out.println("Player quit");
                    connections.remove(player);
                } else if(roomMsg == 0){
                    player.writeMessage(generateScoreBoard());
                } else{
                    isMsgChat = true;
                }
            } catch (NumberFormatException e) {
                isMsgChat = true;
            }            
        }

        if (isMsgChat) {
            // Chat function
            for (PlayerConnection allconns:connections){
                if (!allconns.isIngame()) {
                    allconns.writeMessage(player.getName() + ": " + message);
                }
            }
        }
    }

    public static void main(String[] args) {
        // Check the number of command line arguments
        if (args.length != 1) {
            System.err.println("Usage: java Server <port>");
            System.exit(1);
        }

        // Start the server
        new Server(Integer.parseInt(args[0]));
    }
}
