var http = require('http')
  , serverUrl = 'http://localhost:8080/'
  , server = require('./server')
  , assert = require('assert')
  , async = require('async')
  , request = require('request')
  , streamProxy =  require('..')
  // (
  // { dest: 'http://localhost:8081'
  // })
  ;

function getProxy() {
  var proxy = streamProxy();
  proxy.listen(8080);
  return proxy;
}

server.listen(8081);

describe('stream-proxy', function() {

  describe('first request', function() {

    it('should miss cache /', function(done) {

      var proxy = getProxy();

      request(serverUrl, function(error, info, data) {
        assert.equal(data, '<script src="/hi.js"></script>');
        assert.equal(info.headers.cached, 'miss');
        proxy.close();
        done();
      });

    });

    it('should miss cache /hi.js', function(done) {
      var proxy = getProxy();
      request(serverUrl + 'hi.js', function(error, info, data) {
        assert.equal(data, 'alert("hi");');
        assert.equal(info.headers.cached, 'miss');
        proxy.close();
        done();
      });

    });

  });

  describe('second request', function() {

    it('with no expires should never hit cache /', function(done) {
      var proxy = getProxy();
      async.series([
          function(callback) {
            request(serverUrl, function(error, info, data) {
              assert.equal(data, '<script src="/hi.js"></script>');
              assert.equal(info.headers.cached, 'miss');
              callback();
            });
          },
          function(callback) {
            request(serverUrl, function(error, info, data) {
              assert.equal(data, '<script src="/hi.js"></script>');
              assert.equal(info.headers.cached, 'miss');
              proxy.close();
              done();
              callback();
            });
          },
        ]);
    });
  });

});