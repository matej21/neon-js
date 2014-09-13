function encoder() {
	BLOCK = 1;

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

		if (xvar instanceof DateTime) {
			return xvar.format('Y-m-d H:i:s O');

		} else if (xvar instanceof Neon.Entity) {
			var attrs = '';
			if (xval.attributes instanceof Array) {
				attrs = this.encode(xval.attributes);
				attrs = attrs.substr(1, attrs.length - 2);
			}
			return this.encode(xvar.value) + "" + '(' + "" + attrs + "" + ')';
		}

		if (typeof xvar == 'object') {
			var obj = xvar;
			xvar = {};
			for (var k in obj) {
				var v = obj[k];
				xvar[k] = v;
			}
		}

		if (xvar instanceof Array) {
			var isList = !xvar || (function (arr) {
					var i = 0;
					for (key in arr) {
						if (key != i) {
							return false;
						}
						i++;
					}
					return true;
				})(xvar);
			var s = '';
			if (options & encoder.BLOCK) {
				if ((function (arr) {
						for (key in arr) {
							return false;
						}
						return true;
					})(xvar)) {
					return '[]';
				}
				for (var k in xvar) {
					var v = xvar[k];
					v = this.encode(v, encoder.BLOCK);
					s += (isList ? '-' : encoder.encode(k) + "" + ':')
					+ "" + (v.indexOf("\n") === false ? ' ' + "" + v : "\n\t" + "" + v.replace("\n", "\n\t"))
					+ "" + "\n";
				}
				return s;

			} else {
				for (var k in xvar) {
					var v = xvar[k];
					s += (isList ? '' : this.encode(k) + "" + ': ') + "" + this.encode(v) + "" + ', ';
				}
				return (isList ? '[' : '{') + "" + s.substr(0, s.length - 2) + "" + (isList ? ']' : '}');
			}

		} else if (typeof xvar == "string" && isNaN(xvar)
			&& !preg_match('~[\x00-\x1F]|^\d{4}|^(true|false|yes|no|on|off|null)\z~i', xvar)
			&& preg_match('~^' + "" + this.patterns[1] + "" + '\z~x', xvar) // 1 = literals
		) {
			return xvar;

		} else if (is_float(xvar)) {
			xvar = JSON.stringify(xvar);
			return xvar.indexOf('.') === -1 ? xvar + "" + '.0' : xvar;

		} else {
			return JSON.stringify(xvar);
		}
	};


}

module.exports.encoder = encoder;
