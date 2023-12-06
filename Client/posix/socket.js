const net = require('net');


class TCPClient {
  constructor() {
    this.client = new net.Socket();
    this.setupDataHandler(); // Set up the data handler
  }

  connect(port, host, onConnect, onClose, onError
     ) {
    this.client.connect(port, host, () => {
      if (typeof onConnect === 'function') {
        onConnect();
      }
    });

    this.client.on('close', () => {
      if (typeof onClose === 'function') {
            console.log('🏁 Connection to lobby server closed');
            onClose(); 
        }
    });

    this.client.on('error', (error) => {
      if (typeof onError === 'function') {  
        console.error(`🚧 Error with TCP connection: ${error}`);
        onError(error); }
    
        // Handle the error, and possibly close the connection gracefully
        // client.destroy(); // Close the socket immediately to prevent unhandled error crashes
    });
  }

  onData(callback) {
    this.dataCallback = callback;
  }
  setupDataHandler() {
    this.client.on('data', (data) => {
      if (typeof this.dataCallback === 'function') {
        this.dataCallback(data);
      }
    });
  }

  send(data) {
    this.client.write(data);
  }

  close() {
    this.client.end();
  }
}

module.exports = TCPClient;


// Example usage:
// const client = new TCPClient();

// client.connect(
//     3002, // Port
//     'localhost', // Host
//     () => {
//       console.log('Connected to server');
//       client.send('{"addPlayer": "me"}');
//     },
//     (data) => {
//       console.log('Received:', data);
//     },
//   //   () => {
//   //     console.log('Connection closed');
//   //   },
//     (error) => {
//       console.error('Connection error:', error);
//     }
//   );

// module.exports = client;

// // To send data after connecting
// client.send('Some data');

// // To close the connection
// // client.close();
