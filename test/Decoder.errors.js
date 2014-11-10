var assert = require('assert');
var neon = require('../src/neon');
suite('Decoder.errors', function () {
	test('multiline string', function () {
		assert.throws(function () {
			neon.decode('Hello\nWorld')
		}, /Unexpected \'World\' on line 2, column 1./);
	});
	test('bad comma', function () {
		assert.throws(function () {
			neon.decode('- Dave,\n- Rimmer,\n- Kryten,\n')
		}, /Unexpected ',' on line 1, column 7./);
	});
	test('bad comma 2', function () {
		assert.throws(function () {
			neon.decode('item [a, b]')
		}, /Unexpected ',' on line 1, column 8./);
	});
	test('bad comma 3', function () {
		assert.throws(function () {
			neon.decode('{, }')
		}, /Unexpected ',' on line 1, column 2./);
	});
	test('bad comma 4', function () {
		assert.throws(function () {
			neon.decode('{a, ,}')
		}, /Unexpected ',' on line 1, column 5./);
	});
	test('"', function () {
		assert.throws(function () {
			neon.decode('"')
		}, /Unexpected '\"' on line 1, column 1./);
	});
	test('mix of tabs and spaces', function () {
		assert.throws(function () {
			neon.decode('\ta:\n b"')
		}, /Invalid combination of tabs and spaces on line 2, column 2./);
	});
	test('bad indentation 1', function () {
		assert.throws(function () {
			neon.decode(
				'\n' +
				'a: \n' +
				'  b:\n' +
				' c: x\n')
		}, /Bad indentation on line 4, column 2./);
	});
	test('bad indentation 2', function () {
		assert.throws(function () {
			neon.decode(
				'\n' +
				'a: 1\n' +
				'  b:\n'
			)
		}, /Bad indentation on line 3, column 3./);
	});
	test('bad indentation 3', function () {
		assert.throws(function () {
			neon.decode(
				'\n' +
				'- x:\n' +
				' a: 10\n')
		}, /Bad indentation on line 3, column 2./);
	});
	test('bad indentation 4', function () {
		assert.throws(function () {
			neon.decode(
				'\n' +
				'- x: 20\n' +
				'   a: 10\n')
		}, /Bad indentation on line 3, column 4./);
	});
	test('bad indentation 5', function () {
		assert.throws(function () {
			neon.decode(
				'\n' +
				'- x: 20\n' +
				' a: 10\n')
		}, /Bad indentation on line 3, column 2./);
	});
	test('bad indentation 4', function () {
		assert.throws(function () {
			neon.decode('- x: y:')
		}, /Unexpected ':' on line 1, column 7./);
	});

	test('array-after-key scalar', function() {
		assert.throws(function () {
			neon.decode('\n' +
			'foo:\n' +
			'bar\n')
		}, /Unexpected '<new line>' on line 3, column 4./);
	});
});
