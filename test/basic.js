var api_key = process.env.MAILCHIMP_TEST_API_KEY
var oauth_token = process.env.MAILCHIMP_TEST_OAUTH_TOKEN
var assert = require('assert')
var dc = process.env.DC

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

  it('should work for correctly formated oauth token with a DC', function () {
    var mailchimp = new Mailchimp('token', 'us19')
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
      done(new Error(err));
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

  it('should handle wrong path with promise', function (done) {
    mailchimp.get({
      path : '/wrong',
    }).then(function (result) {
      //Error
      done(result)
    }).catch(function (err) {
      assert.equal(err.status, 404);
      done()
    })
  })

  it('should handle get with just a path', function (done) {
    mailchimp.get('/lists', function (err, result) {
      assert.equal(err, null);

      assert.ok(result)
      assert.ok(result.lists)
      done()
    })
  })

  it('should handle get with just a path with promise', function (done) {
    mailchimp.get('/lists')
      .then(function (result) {
        assert.ok(result);
        assert.ok(result.lists);
        done();
      })
      .catch(function (err) {
        done(new Error(err))
      })
  })

  it('should handle get with a path and query', function (done) {
    mailchimp.get('/lists', {offset : 1}, function (err, result) {
      assert.equal(err, null);

      assert.ok(result)
      assert.ok(result.lists)
      done()
    })
  })

  it('should handle get with a path and query with promise', function (done) {
    mailchimp.get('/lists', {offset : 1})
      .then(function (result) {
        assert.ok(result)
        assert.ok(result.lists)
        done()
      })
      .catch(function (err) {
        done(new Error(err))
      })
  })

})

describe('basic mailchimp api methods with oauth token and dc', function () {

  var mailchimp = new Mailchimp(oauth_token, dc);

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
      done(new Error(err));
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

  it('should handle wrong path with promise', function (done) {
    mailchimp.get({
      path : '/wrong',
    }).then(function (result) {
      //Error
      done(result)
    }).catch(function (err) {
      assert.equal(err.status, 404);
      done()
    })
  })

  it('should handle get with just a path', function (done) {
    mailchimp.get('/lists', function (err, result) {
      assert.equal(err, null);

      assert.ok(result)
      assert.ok(result.lists)
      done()
    })
  })

  it('should handle get with just a path with promise', function (done) {
    mailchimp.get('/lists')
      .then(function (result) {
        assert.ok(result);
        assert.ok(result.lists);
        done();
      })
      .catch(function (err) {
        done(new Error(err))
      })
  })

  it('should handle get with a path and query', function (done) {
    mailchimp.get('/lists', {offset : 1}, function (err, result) {
      assert.equal(err, null);

      assert.ok(result)
      assert.ok(result.lists)
      done()
    })
  })

  it('should handle get with a path and query with promise', function (done) {
    mailchimp.get('/lists', {offset : 1})
      .then(function (result) {
        assert.ok(result)
        assert.ok(result.lists)
        done()
      })
      .catch(function (err) {
        done(new Error(err))
      })
  })

})

describe('batch mailchimp api methods', function () {

  this.retries(2);

  var mailchimp = new Mailchimp(api_key);

  it('should handle batch with single non-array command', function (done) {
    this.timeout(20000)
    mailchimp.batch({
        method : 'get',
        path : '/lists',
      }, {
      verbose : false
    }).then(function (result) {
      assert.ok(result)
      assert.ok(result.lists)
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle batch with single non-array command and query param', function (done) {
    this.timeout(20000)
    mailchimp.batch({
        method : 'get',
        path : '/lists',
        query : {
          count : 1
        },
      }, {
      verbose : false
    }).then(function (result) {
      assert.ok(result)
      assert.ok(result.lists)
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle batch operations with no wait', function (done) {
    this.timeout(20000)
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
      assert.ok(result.submitted_at);
      assert.ok(result.status);
      assert.ok(result.id);
      done()
    }, {
      verbose : false,
      wait : false
    })
  })

  it('should handle batch operations with no wait with promises', function (done) {
    this.timeout(20000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], {
      verbose : false,
      wait : false
    }).then(function (result) {
      assert.ok(result.submitted_at);
      assert.ok(result.status);
      assert.ok(result.id);
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle batch operations with no unpack', function (done) {
    this.timeout(20000)
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
      assert.ok(result.submitted_at);
      assert.equal(result.status, 'finished');
      assert.equal(result.total_operations, 2);
      done()
    }, {
      verbose : false,
      wait : true,
      unpack : false,
    })
  })

  it('should handle batch operations with no unpack with promise', function (done) {
    this.timeout(20000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], {
      verbose : false,
      wait : true,
      unpack : false,
    }).then(function (result) {
      assert.ok(result.submitted_at);
      assert.equal(result.status, 'finished');
      assert.equal(result.total_operations, 2);
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })


  it('should handle batch operations', function (done) {
    this.timeout(20000)
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
    this.timeout(20000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], {
      verbose : false
    }).then(function (result) {
      assert.equal(result.length, 2)
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle batch operations with promise and query', function (done) {
    this.timeout(20000)
    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
        query : {
          count : 8,
        }
      },
      {
        method : 'get',
        path : '/lists',
        query : {
          count : 1,
        }
      },
    ], {
      verbose : false
    }).then(function (result) {
      assert.equal(result.length, 2)
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle batchWait operations', function (done) {
    this.timeout(20000)
    var batch_id;

    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], {
      verbose : false,
      wait : false,
    }).then(function (result) {
      batch_id = result.id;
      mailchimp.batchWait(batch_id, function (err, result) {
        assert.equal(err, null);
        assert.equal(result.length, 2)
        done();
      }, {verbose : false});
    })
  })


  it('should handle batchWait operations with promise', function (done) {
    this.timeout(20000)
    var batch_id;

    mailchimp.batch([
      {
        method : 'get',
        path : '/lists',
      },
      {
        method : 'get',
        path : '/lists',
      },
    ], {
      verbose : false,
      wait : false,
    }).then(function (result) {
      batch_id = result.id;
      return mailchimp.batchWait(batch_id, {verbose : false});
    }).then(function (result) {
      assert.equal(result.length, 2)
      done();
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle empty batch operations with no wait', function (done) {
    this.timeout(20000)
    mailchimp.batch([], {
      verbose : false,
      wait : false
    }).then(function (result) {
      assert.ok(result.submitted_at);
      assert.ok(result.status);
      assert.ok(result.id);
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle empty batch operations with no unpack', function (done) {
    this.timeout(20000)
    mailchimp.batch([], {
      verbose : false,
      wait : true,
      unpack : false,
    }).then(function (result) {
      assert.ok(result.submitted_at);
      assert.equal(result.status, 'finished');
      assert.equal(result.total_operations, 0);
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  it('should handle empty batch', function (done) {
    this.timeout(20000)
    mailchimp.batch([], {
      verbose : false,
    }).then(function (result) {
      assert.ok(result)
      done()
    }).catch(function (err) {
      done(new Error(err));
    })
  })

  
})