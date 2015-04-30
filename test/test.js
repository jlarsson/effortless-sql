/* global describe, it */

var assert = require('assert')

describe('sql().query()', function () {
  it('maps parameters and result columns', function () {
    var sql = createSql()
    return sql.query('select @a as a, @b as b, @c as c', {a: 1, b: 'hello', c: null})
      .then(function (result) {
        assert(result)
        assert(result.rowCount === 1)
        assert.deepEqual([{a: 1, b: 'hello', c: null}], result.rows)
      })
  })
})

describe('sql().queryRows()', function () {
  it('maps result as array of objects', function () {
    return createSql().queryRows('select 1 as a, 11 as b union all select 2 as a, 22 as b')
      .then(function (rows) {
        assert.deepEqual([{a:1, b: 11}, {a:2, b:22}], rows)
      })
  })
})

describe('sql().querySingleRow()', function () {
  it('maps first record', function () {
    return createSql().querySingleRow('select 1 as a, 11 as b union all select 2 as a, 22 as b')
      .then(function (row) {
        assert.deepEqual({a:1, b: 11}, row)
      })
  })
})

describe('sql().exeuteRows()', function () {
  it('maps result as array of objects', function () {
    return createSql().executeRows('TestGetRows')
      .then(function (rows) {
        assert.deepEqual([{a:1, b: 11}, {a:2, b:22}], rows)
      })
  })
})

describe('sql().executeSingleRow()', function () {
  it('maps first record', function () {
    return createSql().executeSingleRow('TestGetRows')
      .then(function (row) {
        assert.deepEqual({a:1, b: 11}, row)
      })
  })
})

function createSql() {
  return require('../index')(require('./test-config'))
}
