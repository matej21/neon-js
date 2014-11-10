var EncoderClass = require("./encoder");
var DecoderClass = require("./decoder");
var encode = function (xvar, options) {
	if (typeof options === "undefined") {
		options = null;
	}

	var encoder = new EncoderClass();
	return encoder.encode(xvar, options);
};


module.exports.encode = encode;
module.exports.decode = function (input) {
	var decoder = new DecoderClass();

	return decoder.decode(input);
};
module.exports.Entity = require('./entity');
module.exports.Map = require('./map');
module.exports.CHAIN = DecoderClass.CHAIN;
module.exports.BLOCK = EncoderClass.BLOCK;
module.exports.Dumper = require('./dumper');
module.exports.Error = require('./error');
