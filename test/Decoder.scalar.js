'use strict';

var assert = require('assert');
var neon = require('../src/neon');

suite('Decoder.scalar', function () {
	test('null', function () {
		assert.equal(neon.decode(''), null);
	});
	test('null 2', function () {
		assert.equal(neon.decode(' '), null);
	});
	test('int 0', function () {
		assert.equal(neon.decode('0'), 0);
	});
	test('float 0.0 (as int)', function () {
		assert.equal(neon.decode('0.0'), 0);
	});
	test('int 1', function () {
		assert.equal(neon.decode('1'), 1);
	});
	test('float -1.2', function () {
		assert.equal(neon.decode('-1.2'), -1.2);
	});
	test('float -1.2e2', function () {
		assert.equal(neon.decode('-1.2e2'), -120);
	});
	test('true', function () {
		assert.ok(neon.decode('true') === true);
	});
	test('false', function () {
		assert.ok(neon.decode('false') === false);
	});
	test('null string', function () {
		assert.ok(neon.decode('null') === null);
	});
	test('literal 1', function () {
		assert.equal(neon.decode('the"string#literal'), 'the"string#literal');
	});
	test('literal 2', function () {
		assert.equal(neon.decode('the"string #literal'), 'the"string');
	});
	test('literal 3', function () {
		assert.equal(neon.decode('"the\'string #literal"'), "the'string #literal");
	});
	test('literal 4', function () {
		assert.equal(neon.decode("'the\"string #literal'"), 'the"string #literal');
	});
	test('literal 5', function () {
		assert.equal(neon.decode('"the\\"string #literal"'), 'the"string #literal');
	});
	test('literal 5', function () {
		assert.equal(neon.decode("<literal> <literal>"), "<literal> <literal>");
	});
	test('empty string 1', function () {
		assert.equal(neon.decode("''"), "");
	});
	test('empty string 2', function () {
		assert.equal(neon.decode('""'), "");
	});
	test('string :a', function () {
		assert.equal(neon.decode(':a'), ":a");
	});
	test('char x', function () {
		assert.equal(neon.decode('x'), "x");
	});
	test('char x 2', function () {
		assert.equal(neon.decode('\nx\n'), "x");
	});
	test('char x 3', function () {
		assert.equal(neon.decode(' x'), "x");
	});
	test('@x', function () {
		assert.equal(neon.decode('@x'), "@x");
	});
	test('@true', function () {
		assert.equal(neon.decode('@true'), "@true");
	});
	test('date', function () {
		assert.deepEqual(neon.decode('2014-05-20'), new Date("2014-05-20"));
	});
	test('spaaace', function () {
		assert.equal(neon.decode('a                     '), "a");
	});
	test('BOM!', function () {
		assert.equal(neon.decode('\xEF\xBB\xBFa'), "a");
	});
	test('unicode', function () {
		assert.equal(neon.decode('"\\u0040"'), '@');
		assert.equal(neon.decode('"\\u011B"'), "\u011B");
		assert.equal(neon.decode('"\\uD834\\uDF06"'), '\uD834\uDF06');

	});
});
