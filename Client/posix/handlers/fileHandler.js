const fs = require('fs');
const path = require('path');

class FileHandler {
  static handleFileRequests(req, res) {
    const filePaths = {
      '/game.css': 'game.css',
      '/fonts/Dekko-Regular.ttf': 'Dekko-Regular.ttf',
      '/lobbystyle.css': 'lobbystyle.css',
      '/scoreboard.css': 'scoreboard.css',
    };

    const requestedPath = req.url;
    const fileName = filePaths[requestedPath];

    if (fileName) {
      const filePath = path.join(__dirname, '..','html', 'styles', fileName);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          let contentType = 'text/plain';
          if (filePath.endsWith('.css')) {
            contentType = 'text/css';
          } else if (filePath.endsWith('.ttf')) {
            contentType = 'font/ttf';
          }
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }
}

module.exports = FileHandler;
