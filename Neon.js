/**
 * Copyright (c) 2004 David Grudl (http://davidgrudl.com)
 * Copyright (c) 2014 David Matejka
 *
 */
var Neon = {};

(function () {
	Neon.CHAIN = '!!chain';

	Neon.encode = function (xvar, options) {
		if (typeof options === "undefined") {
			options = null;
		}

		var encoder = new Encoder;
		return encoder.encode(xvar, options);
	};
	Neon.decode = function (input) {
		var decoder = new Neon.Decoder;
		return decoder.decode(input);
	};

	/**
	 * Simple generator for Nette Object Notation.
	 *
	 * @author     David Grudl
	 */
	Neon.Encoder = function () {
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
				if (options & Neon.Encoder.BLOCK) {
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
						v = this.encode(v, Neon.Encoder.BLOCK);
						s += (isList ? '-' : Encoder.encode(k) + "" + ':')
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


	};


	/**
	 * Representation of 'foo(bar=1)' literal
	 */
	Neon.Entity = function (value, /*array*/ attrs) {

		this.value = null;
		this.attributes = null;

		if (typeof value === "undefined") {
			value = null;
		}

		if (typeof attrs === "undefined") {
			attrs = null;
		}

		this.value = value;
		this.attributes = attrs;
	};

	Neon.Result = function () {
		this.data = null;
		this.key = 0;

		this.add = function (key, value) {
			if (this.data == null) {
				this.data = {};
			}
			if (key == null) {
				this.data[this.key++] = value;
				return true;
			}
			if (key in this.data) {
				return false;
			}
			var number = parseInt(key * 1);
			if (!isNaN(number) && number > this.key) {
				this.key = number;
			}
			this.data[key] = value;
			return true;
		}
	};


	/**
	 * Parser for Nette Object Notation.
	 *
	 * @author     David Grudl
	 * @internal
	 */

	Neon.Decoder = function () {

		/** @var array */
		var tokens;

		/** @var int */
		var pos;

		var input;


		/**
		 * Decodes a NEON string.
		 * @param  input string
		 * @return mixed
		 */
		this.decode = function (input) {

			if (typeof (input) != "string") {
				throw 'Argument must be a string, ' + typeof input + ' given.';

			} else if (input.substr(0, 3) == "\xEF\xBB\xBF") { // BOM
				input = input.substr(3);
			}
			this.input = "\n" + "" + input.replace("\r", "") + "\n"; // \n forces indent detection

			var pattern = '~^(' + "" + Neon.Decoder.patterns.join(')|(') + "" + ')~mi';
			this.tokens = preg_split(pattern, this.input, -1, 1 | 2 | 4);

			var last = this.tokens[this.tokens.length - 1];
			if (this.tokens && !preg_match(pattern, last[0], [])) {
				pos = this.tokens.length - 1;
				this.error();
			}

			this.pos = 0;
			var res = this.parse(null);

			while ((this.tokens[this.pos])) {
				if (this.tokens[this.pos][0][0] === "\n") {
					this.pos++;
				} else {
					this.error();
				}
			}
			return res;
		};


		/**
		 * @param  indent string  indentation (for block-parser)
		 * @param  key mixed
		 * @param  hasKey bool
		 * @return array
		 */
		this.parse = function (indent, key, hasKey) {
			if (typeof key === "undefined") {
				key = null;
			}

			if (typeof hasKey === "undefined") {
				hasKey = false;
			}
			var result = new Neon.Result();
			var inlineParser = indent === false;
			var value = null;
			var hasValue = false;
			var tokens = this.tokens;
			var count = tokens.length;
			var mainResult = result;

			for (; this.pos < count; this.pos++) {
				var t = tokens[this.pos][0];

				if (t === ',') { // ArrayEntry separator
					if ((!hasKey && !hasValue) || !inlineParser) {
						this.error();
					}
					this.addValue(result, hasKey ? key : null, hasValue ? value : null);
					hasKey = hasValue = false;

				} else if (t === ':' || t === '=') { // KeyValuePair separator
					if (hasValue && (typeof value == "object")) {
						this.error('Unacceptable key');

					} else if (hasKey && key == null && hasValue && !inlineParser) {
						this.pos++;
						result[result.length + 1] = this.parse(indent + "" + '  ', value, true);
						var newIndent = (tokens[this.pos], tokens[this.pos + 1]) ? tokens[this.pos][0].substr(1) : ''; // not last
						if (newIndent.length > indent.length) {
							this.pos++;
							this.error('Bad indentation');
						} else if (newIndent.length < indent.length) {
							return mainResult; // block parser exit point
						}
						hasKey = hasValue = false;

					} else if (hasKey || !hasValue) {
						this.error();

					} else {
						key = value;
						hasKey = true;
						hasValue = false;
						result = mainResult;
					}

				} else if (t === '-') { // BlockArray bullet
					if (hasKey || hasValue || inlineParser) {
						this.error();
					}
					key = null;
					hasKey = true;

				} else if ((Neon.Decoder.brackets[t])) { // Opening bracket [ ( {
					if (hasValue) {
						if (t !== '(') {
							this.error();
						}
						this.pos++;
						if (value instanceof Neon.Entity && value.value === Neon.CHAIN) {
							end(value.attributes).attributes = this.parse(false);
						} else {
							value = new Neon.Entity(value, this.parse(false));
						}
					} else {
						this.pos++;
						value = this.parse(false);
					}
					hasValue = true;
					if (!(tokens[this.pos]) || tokens[this.pos][0] !== Neon.Decoder.brackets[t]) { // unexpected type of bracket or block-parser
						this.error();
					}

				} else if (t === ']' || t === '}' || t === ')') { // Closing bracket ] ) }
					if (!inlineParser) {
						this.error();
					}
					break;

				} else if (t[0] === "\n") { // Indent
					if (inlineParser) {
						if (hasKey || hasValue) {
							this.addValue(result, hasKey ? key : null, hasValue ? value : null);
							hasKey = hasValue = false;
						}

					} else {
						while ((tokens[this.pos + 1]) && tokens[this.pos + 1][0][0] === "\n") {
							this.pos++; // skip to last indent
						}
						if (!(tokens[this.pos + 1])) {
							break;
						}

						newIndent = tokens[this.pos][0].substr(1);
						if (indent === null) { // first iteration
							indent = newIndent;
						}
						var minlen = Math.min(newIndent.length, indent.length);
						if (minlen && newIndent.substr(0, minlen) !== indent.substr(0, minlen)) {
							this.pos++;
							this.error('Invalid combination of tabs and spaces');
						}

						if (newIndent.length > indent.length) { // open new block-array or hash
							if (hasValue || !hasKey) {
								this.pos++;
								this.error('Bad indentation');
							}
							this.addValue(result, key, this.parse(newIndent));
							newIndent = (tokens[this.pos], tokens[this.pos + 1]) ? tokens[this.pos][0].substr(1) : ''; // not last
							if (newIndent.length > indent.length) {
								this.pos++;
								this.error('Bad indentation');
							}
							hasKey = false;

						} else {
							if (hasValue && !hasKey) { // block items must have "key"; NULL key means list item
								break;

							} else if (hasKey) {
								this.addValue(result, key, hasValue ? value : null);
								if (key !== null && !hasValue && newIndent === indent) {
									result = result[key];
								}
								hasKey = hasValue = false;
							}
						}

						if (newIndent.length < indent.length) { // close block
							return mainResult; // block parser exit point
						}
					}

				} else if (hasValue) { // Value
					if (value instanceof Neon.Entity) { // Entity chaining
						if (value.value !== Neon.CHAIN) {
							value = new Neon.Entity(Neon.CHAIN, {0: value});
						}
						value.attributes[value.attributes.length + 1] = new Neon.Entity(t);
					} else {
						this.error();
					}
				} else { // Value
					if (typeof this.parse.consts == 'undefined')
						this.parse.consts = {
							'true': true, 'True': true, 'TRUE': true, 'yes': true, 'Yes': true, 'YES': true, 'on': true, 'On': true, 'ON': true,
							'false': false, 'False': false, 'FALSE': false, 'no': false, 'No': false, 'NO': false, 'off': false, 'Off': false, 'OFF': false,
							'null': 0, 'Null': 0, 'NULL': 0,
						};
					if (t[0] === '"') {
						value = preg_replace_callback("#\\\\(?:u[0-9a-f]{4}|x[0-9a-f]{2}|.)#i", this.cbString, t.substr(1, t.length - 2));
					} else if (t[0] === "'") {
						value = t.substr(1, t.length - 2);
					} else if ((this.parse.consts[t]) && (!(tokens[this.pos + 1][0]) || (tokens[this.pos + 1][0] !== ':' && tokens[this.pos + 1][0] !== '='))) {
						value = this.parse.consts[t] === 0 ? null : this.parse.consts[t];
					} else if (!isNaN(t)) {
						value = t * 1;
					} else if (preg_match('#^\\d\\d\\d\\d-\\d\\d?-\\d\\d?(?:(?:[Tt]| +)\\d\\d?:\\d\\d:\\d\\d(?:\\.\\d*)? *(?:Z|[-+]\\d\\d?(?::\\d\\d)?)?)?\\z#', t)) {
						value = new Date(t);
					} else { // literal
						value = t;
					}
					hasValue = true;
				}
			}

			if (inlineParser) {
				if (hasKey || hasValue) {
					this.addValue(result, hasKey ? key : null, hasValue ? value : null);
				}
			} else {
				if (hasValue && !hasKey) { // block items must have "key"
					if (result.data == null) {
						result.data = value; // simple value parser
					} else {
						this.error();
					}
				} else if (hasKey) {
					this.addValue(result, key, hasValue ? value : null);
				}
			}
			return mainResult.data;
		};


		this.addValue = function (result, key, value) {
			if (!result.add(key, value)) {
				this.error("Duplicated key '" + key + "'");
			}
		};


		this.cbString = function (m) {
			var mapping = {'t': "\t", 'n': "\n", 'r': "\r", 'f': "\x0C", 'b': "\x08", '"': '"', '\\': '\\', '/': '/', '_': "\xc2\xa0"};
			var sq = m[0];
			if ((mapping[sq[1]])) {
				return mapping[sq[1]];
			} else if (sq[1] === 'u' && sq.length === 6) {
				return String.fromCharCode(parseInt(sq.substr(2), 16));
			} else if (sq[1] === 'x' && sq.length === 4) {
				return String.fromCharCode(parseInt(sq.substr(2), 16));
			} else {
				this.error("Invalid escaping sequence " + sq + "");
			}
		};


		this.error = function (message) {
			if (typeof message === "undefined") {
				message = "Unexpected '%s'";
			}

			var last = (this.tokens[pos]) ? this.tokens[pos] : null;
			var offset = last ? last[1] : this.input.length;
			var text = this.input.substr(0, offset);
			var line = substr_count(text, "\n");
			var col = offset - ("\n" + "" + text).lastIndexOf("\n") + 1;
			var token = last ? str_replace("\n", '<new line>', last[0].substr(0, 40)) : 'end';
			throw message.replace("%s", token) + "" + " on line " + line + ", column " + col + ".";
		};

	};

	Neon.Decoder.patterns = [
		"'[^'\\n]*' |\t\"(?: \\\\. | [^\"\\\\\\n] )*\"",
		"(?: [^#\"',:=[\\]{}()\\x00-\\x20!`-] | [:-][^\"',\\]})\\s] )(?:[^,:=\\]})(\\x00-\\x20]+ |:(?! [\\s,\\]})] | $ ) |[\\ \\t]+ [^#,:=\\]})(\\x00-\\x20])*",
		"[,:=[\\]{}()-]",
		"?:\\#.*",
		"\\n[\\t\\ ]*",
		"?:[\\t\\ ]+"];

	Neon.Decoder.brackets = {
		'[': ']',
		'{': '}',
		'(': ')'
	};


})();


console.log(Neon.decode("[foo: bar, lorem]"));
