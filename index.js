"use strict";

var request = require('request'),
    tar   = require('tar'),
    zlib    = require('zlib'),
    _       = require('lodash');


function Mailchimp (api_key) {
  var api_key_regex = /.+\-.+/

  if (!api_key_regex.test(api_key)) {
    throw new Error('missing or invalid api key: ' + api_key)
  }


  this.__api_key = api_key;
  this.__base_url = "https://"+ this.__api_key.split('-')[1] + ".api.mailchimp.com/3.0"
}

var formatPath = function (path, path_params) {

  if (!path) {
    path = '/';
  }

  if (path[0] != '/') {
    path = '/' + path;
  }

  if (!path_params) {
    return path;
  }

  if (_.isEmpty(path_params)) {
    return path;
  }

  path = _.reduce(path_params, function (_path, value, param) {
    return _path.replace('{'+param+'}', value);
  }, path)
  
  return path;

}

Mailchimp.prototype.get = function (options, done) {
  options = options || {};
  options = _.clone(options)
  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'get';
  this.request(options, done);
}

Mailchimp.prototype.post = function (options, done) {
  options = options || {};
  options = _.clone(options)
  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'post';
  this.request(options, done);
}

Mailchimp.prototype.patch = function (options, done) {
  options = options || {};
  options = _.clone(options)
  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'patch';
  this.request(options, done);
}

Mailchimp.prototype.put = function (options, done) {
  options = options || {};
  options = _.clone(options)
  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'put';
  this.request(options, done);
}

Mailchimp.prototype.delete = function (options, done) {
  options = options || {};
  options = _.clone(options)
  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'delete';
  this.request(options, done);
}


Mailchimp.prototype.getAndUnpackBatchResults = function (response_body_url, done, opts) {
  var read = request.get(response_body_url);

  var parse = tar.Parse();

  parse.on('entry', function(entry){

    if (!entry.path.match(/\.json/)){
      return
    }

    var result_json = '';
    entry.on('data', function (data) {
      result_json += data.toString();
    })

    entry.on('error', function (err) {
      parse.close();
      entry.close();
      done(err);
    })

    entry.on('end', function () {
      var results = JSON.parse(result_json)

      results.sort(function (result_a, result_b) {
        return result_a.operation_id - result_b.operation_id
      })

      for (var i = 0; i < results.length; i++) {
        results[i] = JSON.parse(results[i].response);
      };

      if (results.length == 1 && opts.unarray) {
        results = results[0];
      }

      done(null, results)
    })



  });

  parse.on('error', function (err) {
    parse.close();
    done(err);
  })

  parse.on('end', function (res) {
    console.log('end', res);
  })


  request.get({
    url : response_body_url,
    encoding : null
  }, function (err, response) {
    if (err) {
      done(err);
      return;
    }
    

    if (response.statusCode != 200) {
      done(new String(response.body));
      return;
    }

    var response_buffer = response.body;

    zlib.gunzip(response_buffer, function (err, result) {
      if (err) {
        done(err);
        return;
      }

      parse.end(result)

    })

  })
}

Mailchimp.prototype.batchWait = function (batch_id, done, opts) {
  opts = opts || {};

  //default unpack to true
  if (opts.unpack !== false) {
    opts.unpack = true;
  }

  var _this = this;

  var interval = opts.interval || '2000'

  var options = {
    method : 'get',
    path : '/batches/' + batch_id
  }


  if (opts.unpack) {
    var _done = done;
    var _this = this;
    done = function (err, result) {
      if (err) {
        _done(err);
        return;
      }

      _this.getAndUnpackBatchResults(result.response_body_url, _done, opts)
    }
  }

  var request = function () {
    _this.request(options, function (err, result) {
      if (err) {
        done(err);
        return;
      }

      if (opts.verbose !== false) {
        console.log('batch status:', result.status, result.finished_operations + '/' + result.total_operations)
      }
      if (result.status == 'finished') {
        done(null, result);
        return
      }

      setTimeout(request, interval)

    })
  }

  
  request();
}

Mailchimp.prototype.batch = function (operations, done, opts) {
  opts = opts || {};

  //default wait to true
  if (opts.wait !== false) {
    opts.wait = true;
  }

  if (!_.isArray(operations)) {
    operations = [operations]
    opts.unarray = true;
  }

  if (opts.wait) {
    var _done = done;
    var _this = this;
    done = function (err, result) {
      if (err) {
        _done(err);
        return;
      }

      _this.batchWait(result.id, _done, opts)
    }
  }


  var _operations = [];
  var id = 0;
  _.each(operations, function (operation) {
    var _operation = _.clone(operation);
    _operation.operation_id = id.toString();
    if (_operation.body) {
      _operation.body = JSON.stringify(_operation.body);
    }
    _operation.path = formatPath(_operation.path, _operation.path_params);

    _operations.push(_operation);
    id++;
  })

  this.request({
    method : 'post',
    path : '/batches',
    body : {
      operations : _operations  
    }
  }, done)

}

Mailchimp.prototype.request = function (options, done) {
  if (!_.isFunction(done)) {
    done = function () {}
  }
  if (!options) {
    done(new Error("No request options given"));
    return;
  }

  if (_.isString(options)) {
    options = {
      path : options,
    }
  }

  var path = formatPath(options.path, options.path_params);
  var method = options.method || 'get';
  var body = options.body || {};
  var params = options.params;
  var query = options.query;

  if (params) {
    console.warn('params is depricated, use query instead');
    if (!query) {
      query = params;
    }
  }

  if (!path || !_.isString(path)) {
    done(new Error('No path given'));
    return;
  }

  request({
    method : method,
    url : this.__base_url + path,
    auth : {
      user : 'any',
      password : this.__api_key
    },
    json : body,
    qs : query
  }, function (err, response) {
    if (err) {
      done(err);
      return;
    }

    if (response.statusCode != 200) {
      console.log(path)
      done(response.body);
      return;
    }


    done(null, response.body)
  })
}


module.exports = exports = Mailchimp;
