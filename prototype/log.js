const https = require(`https`);
const fs = require(`fs`);
const path = require('path');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  cors: false
};


https.createServer(options, (req, res) => {
    const logMessage = `${decodeURIComponent(req.url)} ${new Date().toLocaleString()}\n`;
    console.log(logMessage);

    // Write log to a local file
    const logFilePath = path.join(__dirname, 'log.txt');
    fs.appendFile(logFilePath, logMessage.substring(1), (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    res.writeHead(200);
    res.end();
}).listen(8000);

console.log(`Server running at https://localhost:8000`);