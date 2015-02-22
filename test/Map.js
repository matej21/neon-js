'use strict';

var assert = require('assert');
var Map = require('../src/map');

suite('Map', function () {

	var testItems = [[0, "a"], ["xx", "b"], [5, "c"], [1, "d"]];

	test('set', function () {
		var mapInst = new Map();
		mapInst.set("foo", "bar");
		assert.equal(mapInst.get("foo"), "bar");
		assert.equal(mapInst.length, 1);
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
		assert.equal(mapInst.length, 0);
	});
	test('values, keys, items', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		assert.equal(mapInst.values().length, 4);
		assert.equal(mapInst.keys().length, 4);
		assert.equal(mapInst.items().length, 4);
	});

	test('order', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		var values = mapInst.values();
		for (var i in values) {
			assert.equal(values[i], testItems[i][1]);
		}
		var keys = mapInst.keys();
		for (var i in keys) {
			assert.equal(keys[i], testItems[i][0]);
		}
	});

	test('foreach', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		var i = 0;
		mapInst.forEach(function (key, value) {
			assert.equal(key, testItems[i][0]);
			assert.equal(value, testItems[i][1]);
			i++;
		});
	});

	test('toObject', function () {
		var mapInst = new Map();
		for (var i in testItems) {
			mapInst.set(testItems[i][0], testItems[i][1]);
		}
		assert.deepEqual(mapInst.toObject(), {0: "a", xx: "b", 5: "c", 1: "d"});
	});
	test('deep toObject', function () {
		var mapInst = new Map();
		var nested = new Map();
		nested.set("bar", 1);
		mapInst.set("foo", nested);
		assert.deepEqual(mapInst.toObject(true), {foo: {bar: 1}});
	});

	test('number index', function () {
		var mapInst = new Map();
		mapInst.set(0, "a");
		mapInst.set(null, "b");
		assert.deepEqual(mapInst.toObject(), {0: "a", 1: "b"});
	});
});
