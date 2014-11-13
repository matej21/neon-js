var assert = require('assert');
var neon = require('../src/neon');

suite('Decoder.scalar', function () {
	test('null', function () {
		assert.equal(null, neon.decode(''));
	});
	test('null 2', function () {
		assert.equal(null, neon.decode(' '));
	});
	test('int 0', function () {
		assert.equal(0, neon.decode('0'));
	});
	test('float 0.0 (as int)', function () {
		assert.equal(0, neon.decode('0.0'));
	});
	test('int 1', function () {
		assert.equal(1, neon.decode('1'));
	});
	test('float -1.2', function () {
		assert.equal(-1.2, neon.decode('-1.2'));
	});
	test('float -1.2e2', function () {
		assert.equal(-120, neon.decode('-1.2e2'));
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
		assert.equal('the"string#literal', neon.decode('the"string#literal'));
	});
	test('literal 2', function () {
		assert.equal('the"string', neon.decode('the"string #literal'));
	});
	test('literal 3', function () {
		assert.equal("the'string #literal", neon.decode('"the\'string #literal"'));
	});
	test('literal 4', function () {
		assert.equal('the"string #literal', neon.decode("'the\"string #literal'"));
	});
	test('literal 5', function () {
		assert.equal('the"string #literal', neon.decode('"the\\"string #literal"'));
	});
	test('literal 5', function () {
		assert.equal("<literal> <literal>", neon.decode("<literal> <literal>"));
	});
	test('empty string 1', function () {
		assert.equal("", neon.decode("''"));
	});
	test('empty string 2', function () {
		assert.equal("", neon.decode('""'));
	});
	test('string :a', function () {
		assert.equal(":a", neon.decode(':a'));
	});
	test('char x', function () {
		assert.equal("x", neon.decode('x'));
	});
	test('char x 2', function () {
		assert.equal("x", neon.decode('\nx\n'));
	});
	test('char x 3', function () {
		assert.equal("x", neon.decode(' x'));
	});
	test('@x', function () {
		assert.equal("@x", neon.decode('@x'));
	});
	test('@true', function () {
		assert.equal("@true", neon.decode('@true'));
	});
	test('date', function () {
		assert.deepEqual(new Date("2014-05-20"), neon.decode('2014-05-20'));
	});
	test('spaaace', function () {
		assert.equal("a", neon.decode('a                     '));
	});
	test('BOM!', function () {
		assert.equal("a", neon.decode('\xEF\xBB\xBFa'));
	});
});
