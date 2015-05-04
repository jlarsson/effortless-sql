'use strict'

var debug = require('debug')('effortless-sql')
var Promise = require('native-or-bluebird')
var tedious = require('tedious')

var Connection = tedious.Connection
var Request = tedious.Request
var TYPES = tedious.TYPES

module.exports = function createSql (config) {
  return new Sql(config)
}

module.exports.TYPES = TYPES

function Sql (config) {
  debug('creating sql (%j)', config)
  this.config = config
}

var proto = Sql.prototype

proto.TYPES = TYPES

proto.connect = function sql$connect () {
  debug('connect %j', this.config)
  var config = this.config
  return new Promise(function (resolve, reject) {
    var connection = new Connection(config)
      .on('connect', onConnect)
      .on('debug', debug)
      .on('end', onEnd)
      .on('error', onError)

    function onConnect (err) {
      return err ? reject(err) : resolve(connection)
    }

    function onError (err) {
      connection.close()
      reject(err)
    }

    function onEnd () {
    }
  })
}

proto.query = function sql$query (statement, parameters) {
  debug('query %s', statement)
  return this.connect()
  .then(function (connection) {
    return request(connection, statement, parameters, 'execSql')
  })
}

proto.querySingleRow = function sql$queryRow(statement, parameters) {
  return this.query(statement, parameters)
    .then(mapSingleRow)
}

proto.queryRows = function sql$queryRows(statement, parameters) {
  return this.query(statement, parameters)
    .then(mapRows)
}

proto.execute = function sql$execute (procedure, parameters) {
  return this.connect()
  .then(function (connection) {
    return request(connection, procedure, parameters, 'callProcedure')
  })
}

proto.executeSingleRow = function sql$executeSingleRow (procedure, parameters) {
  return this.execute(procedure, parameters)
    .then(mapSingleRow)
}

proto.executeRows = function sql$executeRows (procedure, parameters) {
  return this.execute(procedure, parameters)
    .then(mapRows)
}

function request (connection, statement, parameters, invokationType) {
  debug('%s (%j)', statement, parameters)
  return new Promise(function (resolve, reject) {
    var result = {
      rows: [],
      returnValue: {},
      duration: 0,
      rowCount: 0
    }

    var startTime = Date.now()

    var request = new Request(statement, function (err, rowCount) {
      connection.close()
      if (err) {
        debug('%s: %s', statement, err)
        return reject(err)
      }
      result.rowCount = rowCount
      result.duration = Date.now() - startTime
      return resolve(result)
    })
    .on('returnValue', onReturnValue)
    .on('columnMetadata', onColumnMetadata)
    .on('row', onRow)

    applyParameters(request, parameters)

    connection[invokationType](request)

    function onRow (columns) {
      var row = {}
      columns.forEach(function (c) {
        row[c.metadata.colName] = c.value
      })
      result.rows.push(row)
    }

    function onReturnValue (name, value) {
      //result.returnValue[name] = value
    }

    function onColumnMetadata (columns) {
    }
  })
}

function applyParameters (request, parameters) {
  if (!parameters) {
    return
  }
  Object.getOwnPropertyNames(parameters).forEach(function (name) {
    var value = normalizeParameter(parameters[name])
    debug('parameter: %s, %j, %s', name, value.type, value.value)
    return request.addParameter(name, value.type, value.value)
  })
}

// With tedious (and TDS), null values are passed the same way independent of
// underlying type, so for null we can choose whatever
var NullPlaceholderType = TYPES.NVarChar

var ParameterNormalizer = {
  'buffer': function (value) { return {value: value, type: TYPES.Image}},
  'datetime': function (value) { return {value: value, type: TYPES.DateTime}},
  'null': function () { return {value: null, type: NullPlaceholderType} },
  'number': function (value) { return isIntNumber(value) ? {value: value, type: TYPES.BigInt} : {value: value, type: TYPES.Float}},
  'param': function (value) { return value },
  'string': function (value) { return {value: value, type: TYPES.NVarChar} },
  'undefined': function () { return {value: null, type: NullPlaceholderType} }
}

function isIntNumber (n) {
  return (n % 1) === 0
}

function mapParameterType (value) {
  if (value === null) {
    return 'null'
  }
  if (typeof value === 'object') {
    if (Buffer.isBuffer(value)) {
      return 'buffer'
    }
    if (value instanceof Date) {
      return 'datetime'
    }
    return 'param'
  }
  return typeof value
}

function normalizeParameter (parameter) {
  var type = mapParameterType(parameter)
  return ParameterNormalizer[type](parameter)
}

function mapRows (result) {
  return result ? result.rows : []
}

function mapSingleRow(result) {
  return mapRows(result)[0]
}
