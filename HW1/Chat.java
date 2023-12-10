import java.net.*;  // ServerSocket, Socket
import java.util.ArrayList;
import java.util.Vector;
import java.io.*;   // InputStream, ObjectInputStream, ObjectOutputStream

public class Chat {
    // Each element i of the follwoing arrays represent a chat member[i]
    private Socket[] sockets = null;             // connection to i
    private InputStream[] indata = null;         // used to check data from i
    private ObjectInputStream[] inputs = null;   // a message from i
    private ObjectOutputStream[] outputs = null; // a message to i
	
	private int[] vector = null;
	private Vector<int[]> vec_queue = new Vector<int[]>();              // maintains vector stamps from the others
	private Vector<String>  msg_queue = new Vector<String>( );      //
	private Vector<Integer> src_queue = new Vector<Integer>( ); 


    /**
     * Is the main body of the Chat application. This constructor establishes
     * a socket to each remote chat member, broadcasts a local user's message
     * to all the remote chat members, and receive a message from each of them.
     *
     * @param port  IP port used to connect to a remote node as well as to
     *              accept a connection from a remote node.
     * @param rank  this local node's rank (one of 0 through to #members - 1)
     * @param hosts a list of all computing nodes that participate in chatting
     */
    public Chat( int port, int rank, String[] hosts ) throws IOException {
		// print out my port, rank and local hostname
		System.out.println( "port = " + port + ", rank = " + rank +
					", localhost = " + hosts[rank] );

		// create sockets, inputs, outputs, and vector arrays
		sockets = new Socket[hosts.length];
		indata = new InputStream[hosts.length];
		inputs = new ObjectInputStream[hosts.length];
		outputs = new ObjectOutputStream[hosts.length];
		int[] vector = new int[hosts.length]; //this is the timestamp


		// establish a complete network
		ServerSocket server = new ServerSocket( port );
		for ( int i = hosts.length - 1; i >= 0; i-- ) {
			if ( i > rank ) {
			// accept a connection from others with a higher rank
			Socket socket = server.accept( );
			String src_host = socket.getInetAddress( ).getHostName( );

			// find this source host's rank
			for ( int j = 0; j < hosts.length; j++ )
				if ( src_host.startsWith( hosts[j] ) ) {
					// j is this source host's rank
					System.out.println( "accepted from " + src_host );

					// store this source host j's connection, input stream
					// and object intput/output streams.
					sockets[j] = socket;
					indata[j]= socket.getInputStream( );
					inputs[j] = 
						new ObjectInputStream( indata[j] );
					outputs[j] = 
						new ObjectOutputStream( socket.getOutputStream( ));
				}
			}
			if ( i < rank ) {
				// establish a connection to others with a lower rank
				sockets[i] = new Socket( hosts[i], port );
				System.out.println( "connected to " + hosts[i] );

				// store this destination host j's connection, input stream
				// and object intput/output streams.
				outputs[i] 
					= new ObjectOutputStream( sockets[i].getOutputStream( ) );
				indata[i] = sockets[i].getInputStream( );
				inputs[i] 
					= new ObjectInputStream( indata[i] );
			}
		}

		// create a keyboard stream
		BufferedReader keyboard
			= new BufferedReader( new InputStreamReader( System.in ) );

		// now goes into a chat
		while ( true ) {
			// read a message from keyboard and broadcast it to all the others.
			if ( keyboard.ready( ) ) {
				// since keyboard is ready, read one line.
				String message = keyboard.readLine( );
			if ( message == null ) {
				// keyboard was closed by "^d"
				break; // terminate the program
			}
			// broadcast a message to each of the chat members.
			vector[rank] += 1; // v(gi)[i] = v(gi) + 1
			for ( int i = 0; i < hosts.length; i++ )
				if ( i != rank ) {
					// of course I should not send a message to myself
					outputs[i].writeObject( vector ); //sends vector
					outputs[i].writeObject( message ); //sends message
					outputs[i].flush( ); // make sure the message was sent
				}
			}

			// read a message from each of the chat members
			for ( int i = 0; i < hosts.length; i++ ) {
				// to intentionally create a misordered message deliveray, 
				// let's slow down the chat member #2.
				try {
					if ( rank == 2 )
					Thread.currentThread( ).sleep( 5000 ); // sleep 5 sec.
				} catch ( InterruptedException e ) {}

                checkqueue(i, hosts, vector);

				// check if chat member #i has something
				if ( i != rank && indata[i].available( ) > 0 ) {
					// read a message from chat member #i and print it out
					// to the monitor
					try {// insert filter here					
						//Read inputs[i].readObject( ). This will be a vector.
						int[] sendVector = (int[])inputs[i].readObject( );

                        //read inputs[i].readObject( ) one more time. This will be an actual message.
						String message = (String)inputs[i].readObject( );

                        //check if this received vector and my vector. If this received vector is ready to accept
                        boolean print = false;

                        for(int j = 0; j < vector.length; j++){ //For each element
                            if(i == j){ 
                                if(sendVector[i]+1 == vector[i]){
                                    print = true; 
                                    // sender’s vector[i] must be one larger than the local host’s vector[i].
                                }
                            }else{ //i!== j
                                if(sendVector[j] <= vector[j]){
                                    print = true; 
                                    // sender’s vector[i] must be smaller than or equal to the local host’s vector[i].
                                }
                            }
                        }

						if(print){
							System.out.println( hosts[i] + ": " + message );
                            vector[i] += 1; 
						}else{
                        //Otherwise this received vector and message are not ready to print out. Therefor,
                        //Enqueue this received vector into vec_queue.
							vec_queue.addElement(sendVector);
                        //Enqueue the receive message into msg_queue.
							msg_queue.add(message);
                        //Enguque Interger( i ), (i.e., this source process ID) into src_queue.	
							src_queue.add(i);						
						}

					} catch ( ClassNotFoundException e ) {}
				}
			}
		}
    }

    /**
     * Checkqueue
     * -----------------------------
     * this function would take in the host's ID, the list of hostnames
     * as well as the vector to update it
     * @param host
     * @param hostnames
     * @param vector
     */
    private void checkqueue(int host, String[] hostnames, int[] vector){
        if(src_queue.isEmpty() == false){
            for(int i = 0; i < vec_queue.size(); i++){ //checking the waitlist to see if any of them are okay to send
                for(int j = 0; j < vector.length; j++){ 
                    if(host == j){ 
                        if(vec_queue.get(i)[host]+1 == vector[host]){
                            System.out.println(hostnames[src_queue.get(i)] + ":" + msg_queue.get(i));
                            vector[host] += 1; 
                            msg_queue.remove(i);
                            vec_queue.remove(i);
                            src_queue.remove(i);
                            i--;
                        }
                    }else{
                        if(vec_queue.get(i)[j] <= vector[j]){
                            System.out.println(hostnames[src_queue.get(i)] + ":" + msg_queue.get(i));
                            vector[host] += 1; 
                            msg_queue.remove(i);
                            vec_queue.remove(i);
                            src_queue.remove(i);
                            i--;
                        }
                    }
                    if(src_queue.isEmpty()){
                        break;
                    }
                }
            }
        }
    } 


    /**
     * Is the main function that verifies the correctness of its arguments and
     * starts the application.
     *
     * @param args receives <port> <ip1> <ip2> ... where port is an IP port
     *             to establish a TCP connection and ip1, ip2, .... are a
     *             list of all computing nodes that participate in a chat.
     */
    public static void main( String[] args ) {
		// verify #args.
		if ( args.length < 2 ) {
			System.err.println( "Syntax: java Chat <port> <ip1> <ip2> ..." );
			System.exit( -1 );
		}

		// retrieve the port
		int port = 0;
		try {
			port = Integer.parseInt( args[0] );
		} catch ( NumberFormatException e ) {
			e.printStackTrace( );
			System.exit( -1 );
		}
		if ( port <= 5000 ) {
			System.err.println( "port should be 5001 or larger" );
			System.exit( -1 );
		}

		// retireve my local hostname
		String localhost = null;
		try {
			localhost = InetAddress.getLocalHost( ).getHostName( );
		} catch ( UnknownHostException e ) {
			e.printStackTrace( );
			System.exit( -1 );
		}

		// store a list of computing nodes in hosts[] and check my rank
		int rank = -1;
		String[] hosts = new String[args.length - 1];
		for ( int i = 0; i < args.length - 1; i++ ) {
			hosts[i] = args[i + 1];
			if ( localhost.startsWith( hosts[i] ) ) 
			// found myself in the i-th member of hosts
			rank = i;
		}

		// now start the Chat application
		try {
			new Chat( port, rank, hosts );
		} catch ( IOException e ) {
			e.printStackTrace( );
			System.exit( -1 );
		}
    }
}
