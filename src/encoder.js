var Entity = require('./entity');
var Decoder = require('./decoder');
var Map = require('./map');

function encoder() {
	/**
	 * Returns the NEON representation of a value.
	 * @param  xvar mixed
	 * @param  options int
	 * @return string
	 */
	this.encode = function (xvar, options) {
		if (typeof options === "undefined") {
			options = null;
		}

		if (xvar instanceof Date) {
			return xvar.format('Y-m-d H:i:s O');

		} else if (xvar instanceof Entity) {
			var attrs = '';
			if (xvar.attributes !== null && typeof xvar.attributes === "object") {
				attrs = this.encode(xvar.attributes);
				attrs = attrs.substr(1, attrs.length - 2);
			}
			return this.encode(xvar.value) + "" + '(' + "" + attrs + "" + ')';
		}

		if (xvar !== null && typeof xvar == 'object') {
			var isMap = xvar instanceof Map;
			var isList = (xvar instanceof Array && (function (arr) {
					var length = 0;
					for (var i in arr) {
						length++;
					}
					return length === arr.length;
				})(xvar)) || (isMap && xvar.isList());
			var s = '';
			xvar = isMap ? xvar.items() : xvar;
			if ((function (arr) {
					for (key in arr) {
						return false;
					}
					return true;
				})(xvar)) {
				return '[]';
			}
			for (var i in xvar) {
				if (isMap) {
					var k = xvar[i].key;
					var v = xvar[i].value;
				} else {
					var k = xvar instanceof Array ? parseInt(i) : i;
					var v = xvar[i];
				}
				if (options & encoder.BLOCK) {
					v = this.encode(v, encoder.BLOCK);
					s += (isList ? '-' : this.encode(k) + "" + ':')
					+ "" + (v.indexOf("\n") === -1 ? (' ' + "" + v) : "\n\t" + "" + v.replace("\n", "\n\t"))
					+ "" + "\n";
				} else {
					s += (isList ? '' : this.encode(k) + "" + ': ') + "" + this.encode(v) + "" + ', ';
				}
			}
			if (options & encoder.BLOCK) {
				return s.trim() + "\n";
			} else {
				return (isList ? '[' : '{') + "" + s.substr(0, s.length - 2) + "" + (isList ? ']' : '}');
			}

		} else if (typeof xvar == "string" && isNaN(xvar)
			&& !xvar.match(/[\x00-\x1F]|^\d{4}|^(true|false|yes|no|on|off|null)$/i)
			&& (new RegExp("^" + Decoder.patterns[1] + "$")).exec(xvar) // 1 = literals
		) {
			return xvar;
		} else {
			return JSON.stringify(xvar);
		}
	};


}
encoder.BLOCK = 1;

module.exports = encoder;
