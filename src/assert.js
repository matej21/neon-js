var mainAssert = require('assert');
var Map = require('./map');
var Entity = require('./entity');

module.exports.equal = function (expected, actual) {
	var mapToObject = function (value) {
		if (value instanceof Map) {
			var obj = {};
			value.forEach(function (key, value) {
				obj[key] = mapToObject(value);
			});
			return obj;
		} else if (value instanceof Entity) {
			value.attributes = mapToObject(value.attributes);
			value.value = mapToObject(value.value);
		}

		return value;
	};
	return mainAssert.deepEqual(expected, mapToObject(actual));
};
