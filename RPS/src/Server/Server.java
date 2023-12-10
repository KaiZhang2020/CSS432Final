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
     * <li> accept a new connection if there is one.
     * <li> add this connection into a list of existing connections
     * <li> for each connection, read a new message and write it to all
     *      existing connections.
     * <li> delete the connection if it is already disconnected.
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
                        // Send landing screen to connection: list out available players
                        String landingMsg = "Welcome " + conn.getName() + " Please choose a player to play with" + "\n";
                        for(int i = 0; i < connections.size(); i++){
                            landingMsg += "ID: " + i + " name: " + connections.get(i).getName() + "\n";
                        }
                        conn.writeMessage(landingMsg);
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
     * Scoreboard
     */
    public static void generateScoreBoard() {
        Collections.sort(connections, new PlayerScoreComparator());
        for(PlayerConnection conn: connections){
            System.out.println("Player: " + conn.getName()+ ": " + conn.getScore());
            conn.writeMessage("Player: " + conn.getName()+ ": " + conn.getScore());
        }
    }

    /**
     * Initialize the list of games
     */
    private static void initializeGameRooms() {
        for (int i = 0; i < MAX_GAMES; i++) {
            games.add(new GameRoom("Room " + i));
        }
    }

    private static void parseLobbyMessage(PlayerConnection player, String message) {
        boolean isMsgChat = false;
        System.out.println("Checking " + player.getName());
        // Read a new message from the connection
        if (message == null) {
            return;
        } else {
            // Try to convert the message to an integer
            try {
                int roomMsg = Integer.parseInt(message);
                //System.out.println(roomMsg);
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
                    generateScoreBoard();
                } else{
                    isMsgChat = true;
                }
            } catch (NumberFormatException e) {
                isMsgChat = true;
            }            
        }

        if (isMsgChat) {
            // Chat function
            for(PlayerConnection allconns:connections){
                if(!allconns.isIngame()){
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
