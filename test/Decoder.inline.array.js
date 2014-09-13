var assert = require('assert');
var assertNeon = require('../src/assert');
var neon = require('../src/neon');
suite('Decoder.inline.array', function () {
	test('{"foo": "bar"}', function () {
		assertNeon.equal({
			foo: "bar"
		}, neon.decode('{"foo":"bar"}'));
	});
	test('true, false, null constants', function () {
		assertNeon.equal({
				0: true, 1: 'tRuE', 2: true, 3: false, 4: false, 5: true, 6: true, 7: false, 8: false, 9: null, 10: null
			}, neon.decode('[true, tRuE, TRUE, false, FALSE, yes, YES, no, NO, null, NULL,]')
		)
	});
	test('on, off, false, numbers', function () {
		assertNeon.equal({
			"false": false,
			"on": true,
			"-5": 1,
			"5.3": 1
		}, neon.decode('{false: off, "on": true, -5: 1, 5.3: 1}'));
	});

	test('long inline', function () {
		assertNeon.equal({
			0: "a",
			1: "b",
			2: {c: "d"},
			e: "f",
			g: null,
			h: null
		}, neon.decode('{a, b, {c: d}, e: f, g:,h:}'))
	});

	test('5', function () {
		assertNeon.equal({
			0: "a",
			1: "b",
			c: 1,
			d: 1,
			e: 1,
			f: null
		}, neon.decode("{a,\nb\nc: 1,\nd: 1,\n\ne: 1\nf:\n}"));
	});
	test('entity 1', function () {
		assert.ok(neon.decode("@item(a, b)") instanceof neon.Entity);
	});
	test('entity 2', function () {
		assertNeon.equal(new neon.Entity("@item", {0: "a", 1: "b"}), neon.decode("@item(a, b)"));
	});
	test('entity 3', function () {
		assertNeon.equal(new neon.Entity("@item<item>", {0: "a", 1: "b"}), neon.decode("@item<item>(a, b)"));
	});
	test('entity 4', function () {
		assertNeon.equal(new neon.Entity("@item", {0: "a", 1: "b"}), neon.decode("@item (a, b)"));
	});
	test('entity 5', function () {
		assertNeon.equal(new neon.Entity({}, {}), neon.decode("[]()"));
	});
	test('entity 6', function () {
		assertNeon.equal(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second")
		}), neon.decode("first(a, b)second"));
	});
	test('entity 7', function () {
		assertNeon.equal(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second", {0: 1, 1: 2})
		}), neon.decode("first(a, b)second(1,2)"));
	});
	test('entity 8', function () {
		assertNeon.equal(new neon.Entity(neon.CHAIN, {
			0: new neon.Entity("first", {0: "a", 1: "b"}),
			1: new neon.Entity("second", {0: 1, 1: 2}),
			2: new neon.Entity("third", {x: "foo", y: "bar"})
		}), neon.decode("first(a, b)second(1,2)third(x: foo, y=bar)"));
	});
});
