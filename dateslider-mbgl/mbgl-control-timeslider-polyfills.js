/*
 * Polyfill: Array.unique()
 */

if (! Array.prototype.unique) {
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
}
