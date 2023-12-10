// Make sure to change the file name into ChatServer.java
/**
 * ChatServer.java:<p>
 *
 *
 * @author  Munehiro Fukuda (CSS, University of Washington, Botheel)
 * @since   1/23/05
 * @version 2/5/05
 */

import java.net.*;          // for Socket and ServerSocket
import java.io.*;           // for IOException
import java.util.*;         // for Vector

public class ChatServer {
    // a list of existing client connections to be declared here.
    ArrayList<Connection> connList = new ArrayList<Connection>();
    /**
     * Creates a server socket with a given port, and thereafter goes into
     * an infinitive loop where:<p>
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
    public ChatServer( int port ) {
        try{
            ServerSocket server = new ServerSocket(port);
            while( true ) {
                try {
                    // Create a sersver socket
                    // ServerSocket server = ....
                    server.setSoTimeout( 500 ); //will be blocked for 500ms upon accept
                    Socket client = server.accept();// accept a new connection
                    if(client == null){   // if this connection is not null
                        continue;
                        //add the new connection into a list of existing connections
                    }else{
                        Connection conn = new Connection(client);
                        connList.add(conn);
                        System.out.println("Added connection: " + conn.name);
                    }
                    
                } catch ( SocketTimeoutException e) {
                    //System.out.println("Socket exception");
                }
                // for each connection, read a new message and write it to all
                // existing connections
                for (Connection connection:connList) {
                    String message = connection.readMessage();
                    //System.out.println("Broadcast: " + message);
                    if(message == null){// read a new message if exist.
                        continue;// make sure that this read won't be blocked.
                    }else{
                        for(Connection allconns:connList){
                            // if you got a message, write it to all connections.
                            if(allconns.isAlive() == true){
                                allconns.writeMessage(message);
                            }else{
                                connList.remove(allconns);
                                // delete this connection if the client disconnected it
                            }
                        }
                    }
                }
            }
                //server.close();
        }catch (IOException e){
            e.printStackTrace();
        }

    }

    /**
     * Usage: java ChatServer <port>
     *
     * @param args a String array where args[0] includes port.
     */
    public static void main( String args[] ) {
        // check if args[0] has port
        if ( args.length != 1 ) {
            System.err.println( "Syntax: java Chatserver <port>" );
            System.exit( 1 );
        }

        // start a chat server
        new ChatServer( Integer.parseInt( args[0] ) );
    }

    /**
     * Represents a connection from a different chat client.
     */
    private class Connection {
        private Socket socket;        // a socket of this connection
        private InputStream rawIn;    // a byte-stream input from client
        private OutputStream rawOut;  // a byte-stream output to client
        private DataInputStream in;   // a filtered input from client
        private DataOutputStream out; // a filtered output to client
        private String name;          // a client name
        private boolean alive;        // indicate if the connection is alive

        /**
         * Creates a new connection with a given socket
         *
         * @param client a socket representing a new chat client
         */
        public Connection( Socket client ) {
            socket = client;
            try {
                rawIn = socket.getInputStream();
                rawOut = socket.getOutputStream();
                in = new DataInputStream(rawIn);
                out = new DataOutputStream(rawOut);
                name = in.readUTF();
                alive = true;
                System.out.println(name); 
            } catch (IOException e) {
                // TODO: handle exception
                e.printStackTrace();
            }
            // from socket, initialize rawIn, rawOut, in, and out.
            // the first message is a client name in unicode format
            // upon a successful initialization, alive should be true.
        }

        /**
         * Reads a new message in unicode format and returns it with this
         * client's name.
         * 
         * @return a unicode message with the client's name
         */
        public String readMessage( ) {
            try {
                if(rawIn.available() > 0){
                    String toReturn; 
                    toReturn = in.readUTF();
                    System.out.println("Readmsg: " + toReturn);
                    return name + ": " + toReturn;
                }else{
                    //System.out.println("Unavailible readmsg");
                    return null;
                }
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
            
            // read a message if it's available.
            // don't block. use available( ). 
            // if it returns a positive number, you can read it.
            // otherwise, skip reading.
        }

        /**
         * Writes a given message through this client's socket.
         *
         * @param message a String to write to the client
         */
        public void writeMessage( String message ) {
            try {
                // write a message
                System.out.println("Output: " + message);
                out.writeUTF(message);
                out.flush();
                // use flush( ) to send it immediately.
            } catch (IOException e) {
                alive = false;
                e.printStackTrace();
            }
            
            // if an exception occurs, you can identify that this connection
            // was gone.
        }

        /**
         * Checks if this connection is still live.
         */
        public boolean isAlive( ) {
            // if the connection was broken, return false.
            return alive;
        }
    }
}
