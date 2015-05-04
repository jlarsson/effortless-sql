## Super simple SQL client for node

[![npm][npm-badge]][npm-url]
[![license][lic-badge]](LICENSE)
[![js-standard-style][style-badge]][style-url]

- Simplest possible api
- Promise based
- Automatic connection lifecycle management
- Reasonable parameter handling by default
- Tested on SQL server
- Naive wrapper around [Tedious](https://www.npmjs.com/package/tedious)
- Works out of the box - no native bindings/gyp builds required
- requires native promises, a promise shim or [bluebird](https://www.npmjs.com/package/bluebird)

```js
var options = {
  userName: 'john',
  password: '******',
  server: '127.0.0.1',
  options: {
    database: 'next-hype'
  }
}

var sql = require('effortless-sql')(options)

sql.queryRows(
  'select readbility, simplicity from Stuff where coolness = @coolness',
    {coolness: 'awesome'})
  .then(function (rows) {
    rows.forEach(function (stuff) {
      console.log('%s - %s', stuff.readbility, stuff.simplicity)
    })
  })
  ```

## API

### Create connection

```js
var sqlFactory = require('effortless-sql')
var sql = sqlFactory(options)
```

```options``` should be compatible with [Tedious](http://pekim.github.io/tedious/getting-started.html), as they are passed along unmodified.

### sql.queryRows([sql statement], [optional parameters])
Returns resulting rows from statement as array of objects with columns mapped
 to properties.

### sql.querySingleRow([sql statement], [optional parameters])
Returns resulting first row or undefined if empty result.

### sql.executeRows(stored procedure name, optional parameters)
Returns resulting rows from stored procedure as array of objects with columns mapped to properties.

### sql.executeSingleRow(stored procedure name, optional parameters)
Returns resulting first row from stored procedure or undefined if empty result.

### sql.query(sql statement, optional parameters)
Returns
```js
{
  rows: <mapped result rows>,
  rowCount: <number of rows reported by server>,
  duration: <time taken in ms>
}
```

### sql.execute(stored procedure name, optional parameters)
Returns
```js
{
  rows: <mapped result rows>,
  rowCount: <number of rows reported by server>,
  duration: <time taken in ms>
}
```

### Parameter mapping
Below, ```T``` is an alias for ```require('effortless-sql').TYPES``` which is same as ```require('tedious').TYPES```

|notation|mapped name|mapped value|mapped type|
|--------|-----------|------------|-----------|
|```{a:null}```|a|null|T.NVarChar|
|```{a:undefined}```|a|null|T.NVarChar|
|```{a:1}```|a|1|T.BigInt|
|```{a:1.2}```|a|1.2|T.Float|
|```{a:'hello'}```|a|'hello'|T.NVarChar|
|```{a:Buffer()}```|a|&lt;buffer bytes&gt;|T.Image|
|```{a:new Date(...)}```|a|&lt;date value&gt;|T.DateTime|
|```{a:{value: 1, type: T.TinyInt}}}```|a|1|T.TinyInt|

## Testing
Tests run on my computer, but are not linked to any CI. I'm ashamed.


[npm-badge]: https://img.shields.io/npm/v/effortless-sql.svg?style=flat
[npm-url]: https://npmjs.org/package/effortless-sql
[lic-badge]: https://img.shields.io/npm/l/effortless-sql.svg?style=flat
[style-badge]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[style-url]: https://github.com/feross/standard
