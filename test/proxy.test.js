var http = require('http')
  , serverUrl = 'http://localhost:8080/'
  , server = require('./server')
  , assert = require('assert')
  , async = require('async')
  , request = require('request')
  , streamProxy =  require('..')
  , destUrl = 'http://localhost:8081'


function getProxy() {

  var httpProxy = http.createServer(function(req, res) {
    // var balance = loadBalancer(
    //   [
    //     { dest: 'http://localhost:8081'
    //     , weight: 0.75
    //     }
    //   , { dest: 'http://localhost:8082'
    //     }
    //   ])

    var debugStream = {
      write: function(d) {
        console.log('WRITE', d)
      },
      end: function(d) {
        console.log('END', d)
      },
      on: function(a, b) {
        console.log('ON', a, b)
      },
      emit: function(e,d) {
        console.log('EMIT',e,d)}
      };

    req.pipe(streamProxy(destUrl)).pipe(res)

  }).listen(8080)

  return httpProxy
}


server.listen(8081)

describe('stream-proxy', function() {

  describe('downstream web server fixture', function() {

    it('should respond', function(done) {
      streamProxy(destUrl)
      request(destUrl, function(error, info, data) {
        assert.equal(data, '<script src="/hi.js"></script>')
        done()
      })
    })

  })

  describe('first request', function() {

    it('should miss cache /', function(done) {

      var proxy = getProxy()

      request(serverUrl, function(error, info, data) {
        assert.equal(data, '<script src="/hi.js"></script>')
        assert.equal(info.headers.cached, 'miss')

        proxy.close()

        done()
      })

    })

    it('should miss cache /hi.js', function(done) {
      var proxy = getProxy()
      request(serverUrl + 'hi.js', function(error, info, data) {
        assert.equal(data, 'alert("hi")')
        assert.equal(info.headers.cached, 'miss')
        proxy.close()
        done()
      })

    })

  })

  describe('second request', function() {

    it('with no expires should never hit cache /', function(done) {
      var proxy = getProxy()
      async.series([
          function(callback) {
            request(serverUrl, function(error, info, data) {
              assert.equal(data, '<script src="/hi.js"></script>')
              assert.equal(info.headers.cached, 'miss')
              callback()
            })
          },
          function(callback) {
            request(serverUrl, function(error, info, data) {
              assert.equal(data, '<script src="/hi.js"></script>')
              assert.equal(info.headers.cached, 'miss')
              proxy.close()
              done()
              callback()
            })
          },
        ])
    })
  })

})