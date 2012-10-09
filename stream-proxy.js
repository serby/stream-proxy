var _ = require('lodash')
  , http = require('http')
  , url = require('url')
  , LRU = require('lru-cache')
  , Stream = require('stream')

module.exports = function streamProxy(destUrl) {

  var requestDetails = url.parse(destUrl)
    , proxyStream = new Stream()
    , dest
    , src

  proxyStream.readable = true
  proxyStream.writable = true

  function proxyRequest() {
    // Set the originating URL on the destination
    requestDetails.path = src.url
    var proxy = http.request(requestDetails, function(proxyResponse) {

      //shouldCache = proxyResponse.headers.expires
      proxyResponse.on('data', function(data) {
        proxyStream.emit('data', data)
        dest.emit('data', data)
      })

      proxyResponse.on('end', function(data) {
        proxyStream.emit('end', data)
        dest.emit('end', data)
        dest.end()
      })

      dest.writeHead(proxyResponse.statusCode, _.extend({ cached: 'miss' }, proxyResponse.headers))
    })

    proxyStream.write = function write(data) {
      proxy.write(data, 'binary')
    }

    proxyStream.end = function end(data) {
      proxy.end(data)
    }

  }

  proxyStream.on('pipe', function(pipeSrc) {
    src = pipeSrc
    proxyRequest()
  })

  proxyStream.pipe = function(streamDest, options) {
    dest = streamDest
    Stream.prototype.pipe.call(proxyStream, dest, options)
  }

  return proxyStream
}