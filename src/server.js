process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var http = require("http");
var {onHTTPRequest} = require("./http");
var {onUpgradeRequest} = require("./ws");

var server = http.createServer(onHTTPRequest);

server.on("upgrade", onUpgradeRequest);

server.listen(8080);