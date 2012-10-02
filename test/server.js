var _ = require('lodash')
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , join = require('path').join
  ;

function serve(res, headers, data) {
  headers['Content-Length'] = data.length;
  res.writeHead(200, headers);
  res.end(data);
}

module.exports = http.createServer(function(req, res) {
  var urlParts = url.parse(req.url)
    ;
  if (urlParts.pathname === '/hi.js') {
    serve(res, { 'Content-Type': 'text/plain' },
     'alert("hi");');
  // } else if (urlParts.pathname === '/big-10meg.dat') {
  //   fs.createReadStream(join(__dirname, 'big-10meg.dat')).pipe(res);
  } else {
    serve(res, { 'Content-Type': 'text/javascript' },
      '<script src="/hi.js"></script>');
  }
});