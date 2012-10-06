module.exports = function shouldUseCache(reqHeaders, resHeaders) {

  var cc = reqHeaders['cache-control']
    , date = new Date().getTime() / 1000
    , resExp = resHeaders.expires
    , resDate = new Date(resHeaders.date).getTime() / 1000


  if (cc === 'no-cache') {
    return false
  } else if (cc !== undefined) {

    var split = cc.split('=')
    if (split.length === 2 && split[0] === 'max-age' &&
        resDate + Number(split[1]) > date) {

      return true
    }
  } else if (resExp !== undefined) {
    return date < new Date(resExp).getTime() / 1000
  }
  return false
}