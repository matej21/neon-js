//var encoder = require("./encoder");
var encode = function (xvar, options) {
	if (typeof options === "undefined") {
		options = null;
	}

	var encoder = new encoder();
	return encoder.encode(xvar, options);
};


module.exports.encode = encode;
module.exports.decode = function (input) {
	var decoder = new (require("./decoder"))();

	return decoder.decode(input);
};
module.exports.Entity = require('./entity').Entity;
module.exports.CHAIN = require('./decoder').CHAIN;
