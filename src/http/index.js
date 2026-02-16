var headerBlacklist = require("../header-blacklist.js");
var http = require("http");
var config = require("../config.js");
var serverModule = config.serverModule;
var headerBlacklist = require("../header-blacklist.js");

function onHTTPRequest(req,res) {
    var proxyHeaders = req.headers || {};
    for (var blockedHeader of headerBlacklist) {
        proxyHeaders[blockedHeader] = null;
        delete proxyHeaders[blockedHeader];
    }
    proxyHeaders["origin"] = config.targetOrigin;
    var proxyReq = serverModule.request({
        host: config.targetHost,
        method: req.method,
        path: req.url,
        headers: proxyHeaders
    }, (proxyRes) => {
        var headers = proxyRes.headers || {};
        for (var blockedHeader of headerBlacklist) {
            headers[blockedHeader] = null;
            delete headers[blockedHeader];
        }
        for (var header of Object.keys(headers)) {
            res.setHeader(header, headers[header]);
        }
        
        proxyRes.pipe(res);
    });

    if (req.method == "POST") {
        req.pipe(proxyReq);
    } else {
        proxyReq.end("");
    }
}

module.exports = {onHTTPRequest};