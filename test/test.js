/* global describe, it */

var assert = require('assert')

describe('foo', function () {
  it('bar', function () {

    var sql = createSql()

    return sql.query('select @a as a, @b as b, @c as c', {a: 1, b: 'hello', c: null})
      .then(function (result) {
        assert(result)
        assert(result.returnValue === undefined)
        assert(result.rowCount === 1)
        assert.deepEqual([{a: 1, b: 'hello', c: null}], result.rows)
      })
  })
})

function createSql() {
  return require('../index')(require('./test-config'))
}
