module.exports = function shouldUseCache (reqHeaders, resHeaders) {
  var cc = reqHeaders['cache-control']
    , exp = reqHeaders.expires
    , date = new Date(resHeaders.date).getTime() / 1000
    ;
  if (cc !== undefined) {

    if (cc === 'no-cache') {
      return false;
    }
    var split = cc.split('=');
    if (split.length === 2) {
      if (split[0] === 'max-age' && date + Number(split[1]) > Date.now() / 1000) {
        return true;
      }
    }
  } else if (exp !== undefined) {
    return date < new Date(exp).getTime() / 1000;
  }
  return false;
};