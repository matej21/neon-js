var entity = require("./entity");
var php = require("./php");


function Result () {
	this.key = 0;
	this.value = null;
	this.add = function (key, value) {
		if (this.value === null) {
			this.value = {};
		}
		if (key === null) {
			this.value[this.key++] = value;
			return true;
		}
		if (key in this.value) {
			return false;

		}
		var number = parseInt(key * 1);
		if (!isNaN(number) && number > this.key) {
			this.key = number;
		}
		this.value[key] = value;
		return true;
	};
};


function decoder() {

	/** @var array */
	this.tokens = [];

	/** @var int */
	this.pos = 0;

	this.input = "";


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

		var pattern = '~^(' + "" + decoder.patterns.join(')|(') + "" + ')~mi';
		this.tokens = php.preg_split(pattern, this.input, -1, 1 | 2 | 4);

		var last = this.tokens[this.tokens.length - 1];
		if (this.tokens && !php.preg_match(pattern, last[0], [])) {
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
		var flatten = function (res) {
			if (res instanceof Result) {
				return flatten(res.value);
			} else if(res instanceof entity.Entity) {
				res.attributes = flatten(res.attributes);
				res.value = flatten(res.value);
			} else if(res instanceof Object) {
				var result = {};
				for(i in res) {
					result[i] = flatten(res[i]);
				}
				return result;
			}
			return res;

		};
		return flatten(res);

	};


	/**
	 * @param  indent string  indentation (for block-parser)
	 * @param  key mixed
	 * @param  hasKey bool
	 * @return array
	 */
	this.parse = function (indent, defaultValue, key, hasKey) {
		if (typeof key === "undefined") {
			key = null;
		}
		if(typeof defaultValue === "undefined") {
			defaultValue = null;
		}

		if (typeof hasKey === "undefined") {
			hasKey = false;
		}
		var result = new Result();
		result.value = defaultValue;
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
					this.addValue(result, null, this.parse(indent + "" + '  ', {}, value, true));
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

			} else if ((decoder.brackets[t])) { // Opening bracket [ ( {
				if (hasValue) {
					if (t !== '(') {
						this.error();
					}
					this.pos++;
					if (value instanceof entity.Entity && value.value === decoder.CHAIN) {
						(function(obj) {
							var last = null;
							for(var i in obj) {
								last = obj[i];
							}
							return last;
						})(value.attributes.value).attributes = this.parse(false, {});
					} else {
						value = new entity.Entity(value, this.parse(false, {}));
					}
				} else {
					this.pos++;
					value = this.parse(false, {});
				}
				hasValue = true;
				if (tokens[this.pos] === undefined || tokens[this.pos][0] !== decoder.brackets[t]) { // unexpected type of bracket or block-parser
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
					while (tokens[this.pos + 1] !== undefined && tokens[this.pos + 1][0][0] === "\n") {
						this.pos++; // skip to last indent
					}
					if (tokens[this.pos + 1] === undefined) {
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
						this.addValue(result, key, this.parse(newIndent, {}));
						newIndent = (tokens[this.pos] !== undefined && tokens[this.pos + 1] !== undefined) ? tokens[this.pos][0].substr(1) : ''; // not last
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
								result = result.value[key] = new Result;
							}

							hasKey = hasValue = false;
						}
					}

					if (newIndent.length < indent.length) { // close block
						return mainResult; // block parser exit point
					}
				}

			} else if (hasValue) { // Value
				if (value instanceof entity.Entity) { // Entity chaining
					if (value.value !== decoder.CHAIN) {
						var attributes = new Result();
						attributes.add(null, value);
						value = new entity.Entity(decoder.CHAIN, attributes);
					}
					value.attributes.add(null, new entity.Entity(t));
				} else {
					this.error();
				}
			} else { // Value
				if (typeof this.parse.consts == 'undefined')
					this.parse.consts = {
						'true': true, 'True': true, 'TRUE': true, 'yes': true, 'Yes': true, 'YES': true, 'on': true, 'On': true, 'ON': true,
						'false': false, 'False': false, 'FALSE': false, 'no': false, 'No': false, 'NO': false, 'off': false, 'Off': false, 'OFF': false,
						'null': 0, 'Null': 0, 'NULL': 0
					};
				if (t[0] === '"') {
					value = t.substr(1, t.length - 2).replace(/#\\\\(?:u[0-9a-f]{4}|x[0-9a-f]{2}|.)/i, function(whole, sq) {
						var mapping = {'t': "\t", 'n': "\n", 'r': "\r", 'f': "\x0C", 'b': "\x08", '"': '"', '\\': '\\', '/': '/', '_': "\xc2\xa0"};
						if (mapping[sq[1]] !== undefined) {
							return mapping[sq[1]];
						} else if (sq[1] === 'u' && sq.length === 6) {
							return String.fromCharCode(parseInt(sq.substr(2), 16));
						} else if (sq[1] === 'x' && sq.length === 4) {
							return String.fromCharCode(parseInt(sq.substr(2), 16));
						} else {
							this.error("Invalid escaping sequence " + sq + "");
						}
					});
				} else if (t[0] === "'") {
					value = t.substr(1, t.length - 2);
				} else if ((this.parse.consts[t]) !== undefined && (tokens[this.pos + 1][0] === undefined || (tokens[this.pos + 1][0] !== ':' && tokens[this.pos + 1][0] !== '='))) {
					value = this.parse.consts[t] === 0 ? null : this.parse.consts[t];
				} else if (!isNaN(t)) {
					value = t * 1;
				} else if (php.preg_match('#^\\d\\d\\d\\d-\\d\\d?-\\d\\d?(?:(?:[Tt]| +)\\d\\d?:\\d\\d:\\d\\d(?:\\.\\d*)? *(?:Z|[-+]\\d\\d?(?::\\d\\d)?)?)?\\z#', t)) {
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
				if (result.value === null) { //if empty
					return value; // simple value parser
				} else {
					this.error();
				}
			} else if (hasKey) {
				this.addValue(result, key, hasValue ? value : null);
			}
		}
		return mainResult;
	};


	this.addValue = function (result, key, value) {
		if (result.add(key, value) === false) {
			this.error("Duplicated key '" + key + "'");
		}
	};




	this.error = function (message) {
		if (typeof message === "undefined") {
			message = "Unexpected '%s'";
		}

		var last = this.tokens[this.pos] !== undefined ? this.tokens[this.pos] : null;
		var offset = last ? last[1] : this.input.length;
		var text = this.input.substr(0, offset);
		var line = text.split("\n").length - 1;
		var col = offset - ("\n" + "" + text).lastIndexOf("\n") + 1;
		var token = last ? last[0].substr(0, 40).replace("\n", '<new line>') : 'end';
		throw new Error(message.replace("%s", token) + "" + " on line " + line + ", column " + col + ".");
	};

}

decoder.patterns = [
	"'[^'\\n]*' |\t\"(?: \\\\. | [^\"\\\\\\n] )*\"",
	"(?: [^#\"',:=[\\]{}()\\x00-\\x20!`-] | [:-][^\"',\\]})\\s] )(?:[^,:=\\]})(\\x00-\\x20]+ |:(?! [\\s,\\]})] | $ ) |[\\ \\t]+ [^#,:=\\]})(\\x00-\\x20])*",
	"[,:=[\\]{}()-]",
	"?:\\#.*",
	"\\n[\\t\\ ]*",
	"?:[\\t\\ ]+"];

decoder.brackets = {
	'[': ']',
	'{': '}',
	'(': ')'
};
decoder.CHAIN = '!!chain';

module.exports = decoder;
