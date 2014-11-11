var assert = require('assert');
var Map = require('../src/map');

suite('Map', function () {

	var testItems = [[0, "a"], ["xx", "b"], [5, "c"], [1, "d"]];

	test('set', function () {
		var mapInst = new Map();
		mapInst.set("foo", "bar");
		assert.equal("bar", mapInst.get("foo"));
		assert.equal(1, mapInst.length);
	});
	test('add', function () {
		var mapInst = new Map();
		assert.ok(mapInst.add("foo", "bar"));
		assert.ok(!mapInst.add("foo", "bar"));
	});

	test('remove', function () {
		var mapInst = new Map();
		mapInst.set("foo", "bar");
		assert.ok(mapInst.has("foo"));
		mapInst.remove("foo");
		assert.ok(!mapInst.has("foo"));
		assert.equal(0, mapInst.length);
	});
	test('values, keys, items', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		assert.equal(4, mapInst.values().length);
		assert.equal(4, mapInst.keys().length);
		assert.equal(4, mapInst.items().length);
	});

	test('order', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		var values = mapInst.values();
		for (var i in values) {
			assert.equal(testItems[i][1], values[i]);
		}
		var keys = mapInst.keys();
		for (var i in keys) {
			assert.equal(testItems[i][0], keys[i]);
		}
	});

	test('foreach', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		var i = 0;
		mapInst.forEach(function (key, value) {
			assert.equal(testItems[i][0], key);
			assert.equal(testItems[i][1], value);
			i++;
		});
	});

	test('toObject', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		assert.deepEqual({0: "a", xx: "b", 5: "c", 1: "d"}, mapInst.toObject());
	});
	test('deep toObject', function () {
		var mapInst = new Map();
		var nested = new Map();
		nested.set("bar", 1);
		mapInst.set("foo", nested);
		assert.deepEqual({foo: {bar: 1}}, mapInst.toObject(true));
	});

	test('number index', function () {
		var mapInst = new Map();
		mapInst.set(0, "a");
		mapInst.set(null, "b");
		assert.deepEqual({0: "a", 1: "b"}, mapInst.toObject());
	});
});
