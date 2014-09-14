var assert = require('assert');
var neon = require('../src/neon');

suite('Encoder', function () {

	test('true, false, null constants and strings', function () {
		assert.equal('[true, "TRUE", "tRuE", "true", false, "FALSE", "fAlSe", "false", null, "NULL", "nUlL", "null", "yes", "no", "on", "off"]',
			neon.encode([
				true, 'TRUE', 'tRuE', 'true',
				false, 'FALSE', 'fAlSe', 'false',
				null, 'NULL', 'nUlL', 'null',
				'yes', 'no', 'on', 'off'
			]));
	});
	test('numbers', function () {
		assert.equal('[1, 1, 0, 0, -1, -1.2, "1", "1.0", "-1"]',
			neon.encode([1, 1.0, 0, 0.0, -1, -1.2, '1', '1.0', '-1'])
		);
	});
	test('symbols', function () {
		assert.equal('["[", "]", "{", "}", ":", ": ", "=", "#"]',
			neon.encode(['[', ']', '{', '}', ':', ': ', '=', '#'])
		);
	});
	test('list', function () {
		assert.equal('[1, 2, 3]',
			neon.encode([1, 2, 3])
		);
	});
	test('object', function () {
		assert.equal('{"1": 1, "2": 2, "3": 3}',
			neon.encode({1: 1, 2: 2, 3: 3})
		);
	});

	test('list with missing key', function () {
		var arr = [];
		arr[1] = 1;
		arr[2] = 2;
		arr[3] = 3;
		assert.equal('{1: 1, 2: 2, 3: 3}',
			neon.encode(arr)
		);
	});

	test('object and array', function () {
		assert.equal('{foo: 1, bar: [2, 3]}',
			neon.encode({foo: 1, bar: [2, 3]})
		);
	});

	test('map with list', function () {
		assert.equal('[1, 2, 3]',
			neon.encode(neon.Map.fromArray([1, 2, 3]))
		);
	});
	test('map with assoc array', function () {
		assert.equal('{"1": 1, foo: 2}',
			neon.encode(neon.Map.fromObject({1: 1, "foo": 2}))
		);
	});
	test('map', function () {
		var map = new neon.Map;
		map.set(1, 1);
		map.set("foo", 2);
		assert.equal('{1: 1, foo: 2}', neon.encode(map));
	});

	test('entity 1', function () {
		assert.equal('item(a, b)',
			neon.encode(neon.decode('item(a, b)'))
		);
	});
	test('entity 2', function () {
		assert.equal('item<item>(a, b)',
			neon.encode(neon.decode('item<item>(a, b)'))
		);
	});
	test('entity 3', function () {
		assert.equal('item(foo: a, bar: b)',
			neon.encode(neon.decode('item(foo: a, bar: b)'))
		);
	});

	test('entity 4', function () {
		assert.equal('[]()',
			neon.encode(neon.decode('[]()'))
		);
	});
	test('entity 5', function () {
		assert.equal('item(0: a, foo: b)',
			neon.encode(neon.decode('item(a, foo: b)'))
		);
	});

	test('entity 6', function () {
		var entity = new neon.Entity("ent");
		entity.attributes = null;
		assert.equal('ent()',
			neon.encode(entity)
		);
	});

	test('block', function () {
		assert.equal("- foo\n" +
		"- bar\n", neon.encode(["foo", "bar"], neon.BLOCK));
	});
	test('block 2', function () {
		assert.equal("x: foo\n" +
		"y: bar\n", neon.encode({x: "foo", y: "bar"}, neon.BLOCK));
	});
	test('block 3', function () {
		assert.equal("x: foo\n" +
		"y:\n" +
		"	- 1\n" +
		"	- 2\n", neon.encode({x: "foo", y: [1,2]}, neon.BLOCK));
	});
	test('block 5', function () {
		assert.equal("x: foo\n" +
		"y:\n" +
		"	- 1\n" +
		"	- 2\n", neon.encode({x: "foo", y: [1, 2]}, neon.BLOCK));
	});

});
