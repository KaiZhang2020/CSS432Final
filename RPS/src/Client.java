import java.net.*;         
import java.io.*;           

public class Client{
    private Socket socket;           
    private InputStream rawIn;       
    private DataInputStream in;      
    private DataOutputStream out;    
    private BufferedReader stdin;    

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
                // the standard input and send to the srever
                if ( stdin.ready( ) ) {
                    String str = stdin.readLine( );
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
            socket.close( );
        } catch(Exception e){
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        if ( args.length != 3 ) {
            System.err.println( "Syntax: java Client <your name> " +
                    "<server ip name> <port>" );
            System.exit( 1 );
        }
        // convert args[2] into an integer that will be used as port.
        int port = Integer.parseInt( args[2] );

        new Client( args[0], args[1], port );
    }
}