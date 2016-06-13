var api_key = process.env.MAILCHIMP_TEST_API_KEY
var assert = require('assert')

var Mailchimp = require('../index');


if (!api_key) {
  throw 'api key is needed to run test suite'
}

describe('handle initialization', function () {
  it('should fail for no api key', function () {
    assert.throws(function () {
      var mailchimp = new Mailchimp(null)  
    })
  })

  it('should fail for invalid api key', function () {
    assert.throws(function () {
      var mailchimp = new Mailchimp('invalid api key format')
    })
    
  })

  it('should work for correctly formated api key', function () {
    var mailchimp = new Mailchimp('key-dc')
  })
})

describe('basic mailchimp api methods', function () {

  var mailchimp = new Mailchimp(api_key);

  it('should handle simple get', function (done) {
    mailchimp.get({
      path : '/lists',
    }, function (err, result) {
      assert.equal(err, null);

      assert.ok(result)
      assert.ok(result.lists)
      done()
    })
  })

  it('should handle wrong path', function (done) {
    mailchimp.get({
      path : '/wrong',
    }, function (err, result) {
      assert.equal(err.status, 404);
      done()
    })
  })

  it('should handle simple get with promise', function (done) {
    mailchimp.get({
      path : '/lists',
    }).then(function (result) {
      assert.ok(result)
      assert.ok(result.lists)
      done()
    }).catch(function (err) {
      throw err;
    })
  })

  it('should handle wrong path with promise', function (done) {
    mailchimp.get({
      path : '/wrong',
    }).then(function (result) {
      throw err;
    }).catch(function (err) {
      assert.equal(err.status, 404);
      done()
    })
  })

})

describe('batch mailchimp api methods', function () {

  var mailchimp = new Mailchimp(api_key);

  it('should handle batch operations', function (done) {
    this.timeout(100000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], function (err, result) {
      assert.equal(err, null);
      assert.equal(result.length, 2)
      done()
    }, {
      verbose : false
    })
  })

  it('should handle batch operations with promise', function (done) {
    this.timeout(100000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ]).then(function (result) {
      assert.equal(result.length, 2)
      done()
    }).catch(function (err) {
      throw err;
    })
  })
})