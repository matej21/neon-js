var assert = require('assert');
var neon = require('../src/neon');
suite('Decoder.array', function () {
	test('empty list', function () {
		assert.deepEqual({
			a: {}
		}, neon.decode(
			"a: []\n"
		))
	});
	test('empty value', function () {
		assert.deepEqual({
			a: null,
			b: 1
		}, neon.decode(
			"a: \n" +
			"b:1\n"
		))
	});
	test('1', function () {
		assert.deepEqual({
			a: {0: 1, 1: 2},
			b: 1
		}, neon.decode(
			"\n" +
			"a: {1, 2, }\n" +
			"b:1"
		));
	});
	test('2', function () {
		assert.deepEqual({
			a: 1,
			b: 2
		}, neon.decode(
			" a: 1\n" +
			" b: 2"
		));
	});
	test('3', function () {
		assert.deepEqual({
			a: "x",
			0: "x"
		}, neon.decode(
			"\n" +
			"a: x\n" +
			"- x"
		));
	});
	test('4', function () {
		assert.deepEqual({
			0: "x",
			a: "x"
		}, neon.decode(
			"\n" +
			"- x\n" +
			"a: x"
		));
	});
	test('5', function () {
		assert.deepEqual({
			a: {0: 1, 1: {0: 2}},
			b: {0: 3},
			c: null,
			0: 4
		}, neon.decode(
			"\n" +
			"a:\n" +
			"- 1\n" +
			"-\n" +
			" - 2\n" +
			"b:\n" +
			"- 3\n" +
			"c: null\n" +
			"- 4"
		));
	});
	test('5', function () {
		assert.deepEqual({
			x: {0: "x", a: "x"}
		}, neon.decode("\n" +
			"x:\n" +
			"	- x\n" +
			"	a: x\n"
		));
	});
	test('6', function () {
		assert.deepEqual({
			x: {y: {0: null}},
			a: "x"
		}, neon.decode(
			"x:\n" +
			"	y:\n" +
			"		-\n" +
			"a: x"
		));
	});
	test('7', function () {
		assert.deepEqual({
			x: {a: 1, b: 2}
		}, neon.decode(
			"\n" +
			"x: {\n" +
			"	a: 1\n" +
			"b: 2\n" +
			"}\n"
		));
	});
	test('8', function () {
		assert.deepEqual({
			0: "one",
			1: "two"
		}, neon.decode(
			"\n" +
			"{\n" +
			"	one\n" +
			"two\n" +
			"}\n"
		));
	});
	test('9', function () {
		assert.deepEqual({
			0: {x: 20, 0: {a: 10, b: 10}},
			1: {arr: {0: 10, 1: 20}},
			2: "y"
		}, neon.decode(
			"\n" +
			"- x: 20\n" +
			"  - a: 10\n" +
			"    b: 10\n" +
			"- arr:\n" +
			"  - 10\n" +
			"  - 20\n" +
			"- y\n"
		));
	});
	test('10', function () {
		assert.deepEqual({
			root: {0: {key1: null, key3: 123}}
		}, neon.decode(
			"\n" +
			"root:\n" +
			"\t- key1:\n" +
			"\t  key3: 123\n" +
			"\t"
		))
	});
	test('11', function () {
		assert.deepEqual({
			0: {x: {a: 10}}
		}, neon.decode(
			"\n" +
			"- x:\n" +
			"    a: 10\n"
		));
	});
	test('12', function () {
		assert.deepEqual({
			x: {a: 10},
			y: {b: 20}
		}, neon.decode(
			"\n" +
			"x:\n" +
			"\t a: 10\n" +
			"y:\n" +
			" \tb: 20\n"
		))
	});
	test('13', function() {
		assert.deepEqual({
			0: {"null": 42},
			"null": 42
		}, neon.decode(
			"\n" +
			"- {null= 42}\n" +
			"null : 42\n"
		))
	});
})
;
