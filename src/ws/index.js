var headerBlacklist = require("../header-blacklist.js");
var config = require("../config.js");
var tls = require('tls');
var net = require('net');

function onUpgradeRequest(clientRequest, clientSocket, clientHead) {
    const options = {
        host: config.targetHost,
        port: 443,
        servername: config.targetHost, 
        rejectUnauthorized: false
    };

    const targetSocket = tls.connect(options, () => {
        clientSocket.setTimeout(0);
        targetSocket.setTimeout(0);
        clientSocket.setNoDelay(true);
        targetSocket.setNoDelay(true);
        let headers = `${clientRequest.method} ${clientRequest.url} HTTP/${clientRequest.httpVersion}\r\n`;
        for (let i = 0; i < clientRequest.rawHeaders.length; i += 2) {
            const key = clientRequest.rawHeaders[i];
            const value = clientRequest.rawHeaders[i + 1];
            if (headerBlacklist && headerBlacklist.includes(key)) continue;
            if (key.toLowerCase() === 'host') {
                headers += `Host: ${config.targetHost}\r\n`;
            } else if (key.toLowerCase() === 'origin') {
                headers += `Origin: https://${config.targetHost}\r\n`;
            } else {
                headers += `${key}: ${value}\r\n`;
            }
        }
        headers += '\r\n';

        targetSocket.write(headers);
        targetSocket.write(clientHead);

        clientSocket.pipe(targetSocket).pipe(clientSocket);
    });

    targetSocket.on('error', (err) => {
        console.error('Target Socket Error:', err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Client Socket Error:', err.message);
        targetSocket.end();
    });

    targetSocket.on('end', () => clientSocket.end());
    clientSocket.on('end', () => targetSocket.end());
}

module.exports = {onUpgradeRequest};