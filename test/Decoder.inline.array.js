var assert = require('assert');
var neon = require('../src/neon');
suite('Decoder.array', function () {
	test('{"foo": "bar"}', function () {
		assert.deepEqual({
			foo: "bar"
		}, neon.decode('{"foo":"bar"}'));
	});
	test('true, false, null constants', function () {
		assert.deepEqual({
				0: true, 1: 'tRuE', 2: true, 3: false, 4: false, 5: true, 6: true, 7: false, 8: false, 9: null, 10: null
			}, neon.decode('[true, tRuE, TRUE, false, FALSE, yes, YES, no, NO, null, NULL,]')
		)
	});
	test('on, off, false, numbers', function () {
		assert.deepEqual({
			"false": false,
			"on": true,
			"-5": 1,
			"5.3": 1
		}, neon.decode('{false: off, "on": true, -5: 1, 5.3: 1}'));
	});

	test('long inline', function () {
		assert.deepEqual({
			0: "a",
			1: "b",
			2: {c: "d"},
			e: "f",
			g: null,
			h: null
		}, neon.decode('{a, b, {c: d}, e: f, g:,h:}'))
	});

	test('5', function () {
		assert.deepEqual({
			0: "a",
			1: "b",
			c: 1,
			d: 1,
			e: 1,
			f: null
		}, neon.decode("{a,\nb\nc: 1,\nd: 1,\n\ne: 1\nf:\n}"));
	});
	test('entity', function () {
		assert.ok(neon.decode("@item(a, b)") instanceof neon.Entity);
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity("@item", {0: "a", 1: "b"}), neon.decode("@item(a, b)"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity("@item<item>", {0: "a", 1: "b"}), neon.decode("@item<item>(a, b)"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity("@item", {0: "a", 1: "b"}), neon.decode("@item (a, b)"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity({}, {}), neon.decode("[]()"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second")
		}), neon.decode("first(a, b)second"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second", {0: 1, 1: 2})
		}), neon.decode("first(a, b)second(1,2)"));
	});
	test('entity', function () {
		assert.deepEqual(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second", {0: 1, 1: 2}),
			2: new neon.Entity("third", {x: "foo", y: "bar"})
		}), neon.decode("first(a, b)second(1,2)third(x:foo, y=bar)"));
	});
});
