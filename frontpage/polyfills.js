/*
 * Some lightweight JavaScript polyfills
 */

String.prototype.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};


Array.prototype.unique = function () {
    var result = [], val, ridx;
    outer:
    for (var i = 0, length = this.length; i < length; i++) {
        val = this[i];
        ridx = result.length;
        while (ridx--) {
          if (val === result[ridx]) continue outer;
        }
        result.push(val);
    }
    return result;
};
