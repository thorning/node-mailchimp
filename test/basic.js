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


  it.skip('should handle batch operations', function (done) {
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
})