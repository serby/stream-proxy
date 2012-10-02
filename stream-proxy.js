var _ = require('lodash')
  , http = require('http')
  , url = require('url')
  , destUrl = 'http://localhost:8081'
  , fs = require('fs')
  , join = require('path').join
  , LRU = require('lru-cache')
  ;

module.exports = function streamProxy (options) {

  var cache = LRU(100)
    ;
  return http.createServer(function(req, res) {

    var requestDetails = url.parse(destUrl)
      ;

    requestDetails.path = req.url;

    var cacheData = cache.get(req.url);

    if (cacheData) {
      res.writeHead(200, cacheData.headers);
      res.end(cacheData.data);
      return false;
    }

    var proxy = http.request(requestDetails, function(proxyResponse) {

      var data =
        { data: ''
        }
        , shouldCache = proxyResponse.headers.expires
        ;


      proxyResponse.on('data', function(chunk) {
        res.write(chunk, 'binary');
        if (shouldCache) {
          data.data += chunk;
        }
      });

      proxyResponse.on('end', function() {

        // only cache if we need to
        if (data.data) {
          cache.set(req.url, data);
        }

        res.end();
      });

      data.headers = _.extend({ cached: 'hit' }, proxyResponse.headers);
      res.writeHead(proxyResponse.statusCode, _.extend({ cached: 'miss' }, proxyResponse.headers));
    });

    req.on('data', function(chunk) {
      proxy.write(chunk, 'binary');
    });

    req.on('end', function() {
      proxy.end();
    });

  });
};
