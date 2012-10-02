var assert = require('assert')
  , shouldCache = require('../should-cache')
  ;

function getResponseHeaders() {
  return { date: (new Date()).toString()
    };
}

describe('shouldCache', function() {
  it('should not use cache if cache-control: no-cache is set', function() {
    assert(!shouldCache({ 'cache-control': 'no-cache' }, getResponseHeaders()));
  });
  it('should use cache if cache-control: max-age=100 and content newer', function() {
    assert(shouldCache({ 'cache-control': 'max-age=100' }, getResponseHeaders())  );
  });
  it('should not use cache if cache-control: max-age=100 and content is older', function() {
    var resHeaders = getResponseHeaders();

    // Set date from an hour ago
    resHeaders.date = new Date(Date.now() - 3600000);
    assert(!shouldCache({ 'cache-control': 'max-age=100' }, resHeaders)  );
  });
  it('should not use cache if cache-control: max-age=0', function() {
    var resHeaders = getResponseHeaders();
    assert(!shouldCache({ 'cache-control': 'max-age=0' }, resHeaders)  );
  });
  it('should use cache if expires is in the future', function() {
    var resHeaders = getResponseHeaders();
    assert(shouldCache({ 'expires': (new Date(Date.now() + 3600)).toString() }, resHeaders));
  });
});