import java.net.*;          // for Socket
import java.io.*;           // for IOException

public class Client{
    private Socket socket;           // a socket connection to a chat server
    private InputStream rawIn;       // an input stream from the server
    private DataInputStream in;      // a filtered input stream from the server
    private DataOutputStream out;    // a filtered output stream to the server
    private BufferedReader stdin;    // the standart input

    public Client(String name, String server, int port ){
        try {
            socket = new Socket( server, port );
	        rawIn = socket.getInputStream( );

            in = new DataInputStream( rawIn );
            out = new DataOutputStream( socket.getOutputStream( ) );
            stdin = new BufferedReader( new InputStreamReader( System.in ) );
            out.writeUTF( name );

            while( true ) {
                // If the user types something from the keyboard, read it from
                // the standard input and simply forward it to the srever
                if ( stdin.ready( ) ) {
                    String str = stdin.readLine( );
                    // no more keyboard inputs: the user typed ^d.
                    if ( str == null )
                    break;
                    out.writeUTF( str );
                }
        
                // If the server gives me a message, read it from the server
                // and write it down to the standard output.
                if ( rawIn.available( ) > 0 ) {
                    String str = in.readUTF( );
                    System.out.println( str );
                }
            }
            // Close the connection. That's it.
            socket.close( );
        } catch(Exception e){
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        if ( args.length != 3 ) {
            System.err.println( "Syntax: java ChatClient <your name> " +
                    "<server ip name> <port>" );
            System.exit( 1 );
        }
        // convert args[2] into an integer that will be used as port.
        int port = Integer.parseInt( args[2] );

        // instantiate the main body of ChatClient application.
        new Client( args[0], args[1], port );
    }
}