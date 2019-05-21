var through = require('through2');

module.exports = function (file, opts) {

  opts = opts || {};
  var code = "";

  var templateUrlRegex = /template *:(\s*['"`](.*?)['"`]\s*([,}]))/gm;
  var stylesRegex = /styles *:(\s*\[[^\]]*?\])/g;
  var stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

  function replaceStringsWithRequires(string) {
    return string.replace(stringRegex, function (match, quote, url) {
      return `require('${url.charAt(0) !== "." ? "./" + url : url}')`;
    });
  }

  var styleProperty = 'styles';
  var templateProperty = 'template';

  return through(
    function (buf, enc, next) {
      code += buf.toString("utf8");
      next()
    },
    function (next) {
      code = code.replace(templateUrlRegex, function (match, url) {
          return templateProperty + ":" + replaceStringsWithRequires(url);
        })
        .replace(stylesRegex, function (match, urls) {
          return styleProperty + ":" + replaceStringsWithRequires(urls);
        });
      this.push(new Buffer(code))
      next();
    }
  )
};