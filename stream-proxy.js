var _ = require('lodash')
  , http = require('http')
  , url = require('url')
  , destUrl = 'http://localhost:8081'
  , fs = require('fs')
  , join = require('path').join
  , LRU = require('lru-cache')
  , Stream = require('stream')
  , responseStream = require('response-stream')
  , es = require('event-stream')

module.exports = function streamProxy (destUrl, req, res) {

  var cache = LRU(100)
    , requestDetails = url.parse(destUrl)
    , proxyStream = new Stream()

  // Set the originating URL on the destination
  requestDetails.path = req.url

  proxyStream.readable = true

  var proxy = http.request(requestDetails, function(proxyResponse) {

    var data =
      { data: ''
      }
      , shouldCache = proxyResponse.headers.expires

    proxyResponse.on('data', function(chunk) {
      proxyStream.emit('data', chunk)
    })

    proxyResponse.on('end', function() {
      proxyStream.emit('end')
    })

    res.writeHead(proxyResponse.statusCode, _.extend({ cached: 'miss' }, proxyResponse.headers))
  })

  req.on('data', function(chunk) {
    proxy.write(chunk, 'binary')
  })

  req.on('end', function() {
    proxy.end()
  })

  return proxyStream
}