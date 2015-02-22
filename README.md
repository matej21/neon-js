NEON-JS - [NEON](http://ne-on.org/) decoder and encoder for JavaScript
=====================================================================

[![Build Status](https://travis-ci.org/matej21/neon-js.svg?branch=master)](https://travis-ci.org/matej21/neon-js)
[![NPM version](https://img.shields.io/npm/v/neon-js.svg)](https://www.npmjs.org/package/neon-js)

NEON is very similar to YAML.The main difference is that the NEON supports "entities"
(so can be used e.g. to parse phpDoc annotations) and tab characters for indentation.
NEON syntax is a little simpler and the parsing is faster.

Example of Neon code:

```
# my web application config

php:
	date.timezone: Europe/Prague
	zlib.output_compression: yes  # use gzip

database:
	driver: mysql
	username: root
	password: beruska92

users:
	- Dave
	- Kryten
	- Rimmer
```

Installation:
------------
### NEON module for node.js
```
npm install neon-js
```

CLI executable is not available yet.

### NEON for browser

You can create browser compatible library using browserify.
```
npm install browserify
browserify -r neon-js -s neon
```

You can found precompiled browserifed version in repository [matej21/neon-js-dist](https://github.com/matej21/neon-js-dist).

```html
<script src="dist/neon.js"></script>
<script type="text/javascript">
var data = neon.decode("hello: world")
</script>
```

API
---

```javascript
var neon = require('neon-js');

try {
	var result = neon.decode("foo: {bar: 123}")
} catch (e) {
	if (e instanceof neon.Error) {
		console.log(e.message);
	}
	throw e;
}
```

### `decode(input)`

Decodes input NEON string.

```javascript
var result = neon.decode(input);
```

### `encode(var[, options])`

Encodes javascript to NEON.

```javascript
var data = {foo: "bar"}
var result = neon.encode(data);
//or you can use block mode
var result = neon.encode(data, neon.BLOCK);
```

### Entity

Class representing NEON entity.

```javascript
var entity = neon.decode("Foo(bar)");
entity.value; "Foo";
entity.attributes// neon.Map instance, see bellow
```

### Map

NEON was originally written for PHP where all NEON array-like structures (lists, objects or mixed) were converted to the PHP array. And arrays in PHP are very powerful - they can be treated as a list, hash table and more. `neon.Map` is trying to keep the very basic of this behaviour - items are ordered (list) and can have string key (hash table). Therefore all NEON array-like structures are mapped to the `neon.Map`.

```
#example neon
foo: bar
- lorem
ipsum: dolor
- sit
```

```javascript
var map = neon.decode(input);
//map instanceof neon.Map
```

#### `Map.get(key)`

Returns value by the key.

```javascript
map.get("foo"); // bar
map.get(0); // lorem
map.get("xxx"); //throws an Error
```

#### `Map.has(key)`

Checks if the given key exists in the map.

```javascript
map.has("foo"); // true
map.has("xxx"); // false
```

#### `Map.forEach(callable)`

Calls provided function for every item in the map. Key is passed as a first argument, value as a second argument.

```javascript
map.forEach(function (key, value) {

});
```

#### `Map.isList()`

Checks if Map is a list. That means the map doesn't contain any string keys and numeric keys are in range `0..(length-1)`.

```javascript
map.isList(); //false
```

#### `Map.values()`

Returns values as an array.

```javascript
var values = map.values();
// ["bar", "lorem", "dolor", "sit"]
```

#### `Map.keys()`

Returns keys as an array.

```javascript
var keys = map.keys();
// ["foo", 0, "ipsum", 1]
```

#### `Map.items()`

Returns items structure. This structure is an array where every item is object with properties `key` and `value`.

```javascript
var items = map.items();

// [{key: "foo", value: "bar"}, ...]
```

#### `Map.toObject([deep])`

Converts Map to javascript object. Items order may be lost.
```javascript
var obj = map.toObject();
// {foo: "bar", 0: "lorem", ipsum: "dolor", 1: sit}
```

### `Dumper.toText(data)`

Dumps decoded structure into simple text output as you can see in the [demo](http://matej21.github.io/neon-js-dist/).

```javascript
var text = neon.Dumper.toText(data)`;
```


Links:
------
- [Official Neon homepage](http://ne-on.org)
- [Neon-js sandbox](http://matej21.github.io/neon-js-dist/)
- [Neon for PHP](https://github.com/nette/neon)
- [Neon-js for browser](http://www.github.com/matej21/neon-js-dist/)
