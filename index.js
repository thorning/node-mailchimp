"use strict";

var request = require('request'),
    tar   = require('tar'),
    zlib    = require('zlib'),
    Promise = require("bluebird"),
    _       = require('lodash');


Promise.config({
    // Enables all warnings except forgotten return statements.
    warnings: {
        wForgottenReturn: false
    }
});

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

Mailchimp.prototype.get = function (options, query, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'get';

  if (!done && _.isFunction(query)) {
    done = query;
    query = null;
  }

  if (query && options.query) {
    console.warn('query set on request options overwritten by argument query');
  }

  if (query) {
    options.query = query;
  }

  return this.request(options, done);
}

Mailchimp.prototype.post = function (options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'post';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
}

Mailchimp.prototype.patch = function (options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'patch';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
}

Mailchimp.prototype.put = function (options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path : options,
    }
  }
  options.method = 'put';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
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
  return this.request(options, done);
}


Mailchimp.prototype._getAndUnpackBatchResults = function (response_body_url, opts) {

  return new Promise(function (resolve, reject) {
    var read = request.get(response_body_url);

    var parse = tar.Parse();

    var results = [];

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
        reject(new Error(err));
      })

      entry.on('end', function () {
        results.push(JSON.parse(result_json));

        

        
      })
    });

    parse.on('error', function (err) {
      parse.close();
      reject(new Error(err));
    })

    parse.on('end', function (res) {
      results = _.flatten(results);
      
      //TODO: implement linear sort uding operation id is linear from 0 to length-1
      results.sort(function (result_a, result_b) {
        return result_a.operation_id - result_b.operation_id
      })

      for (var i = 0; i < results.length; i++) {
        results[i] = JSON.parse(results[i].response);
      };

      resolve(results)
    })


    request.get({
      url : response_body_url,
      encoding : null
    }, function (err, response) {
      if (err) {
        reject(new Error(err));
        return;
      }
      

      if (response.statusCode != 200) {
        reject(Object.assign(new Error(), response.body));
        return;
      }

      var response_buffer = response.body;

      zlib.gunzip(response_buffer, function (err, result) {
        if (err) {
          reject(new Error(err));
          return;
        }

        parse.end(result)

      })

    })

  })


  
}

Mailchimp.prototype.batchWait = function (batch_id, done, opts) {
  var mailchimp = this; 

  //If done is not a function, and no opts are given, second argument is the opts
  if (!opts && !_.isFunction(done)) {
    opts = done;
    done = null;
  }

  opts = _.clone(opts) || {};


  if (!opts.interval) {
    opts.interval = 2000
  }
  
  //default unpack to true
  if (opts.unpack !== false) {
    opts.unpack = true;
  }

  //default verbose to true
  if (opts.verbose !== false) {
    opts.verbose = true;
  }

  var options = {
    method : 'get',
    path : '/batches/' + batch_id
  }

  var promise = new Promise(function (resolve, reject) {
    var request = function () {
      mailchimp.request(options)
        .then(function (result) {
          if (opts.verbose) {
            console.log('batch status:', result.status, result.finished_operations + '/' + result.total_operations)
          }
          if (result.status == 'finished') {
            resolve(result);
            return;
          }

          setTimeout(request, opts.interval);

      }, reject)
    }

    request();
  })

  if (opts.unpack) {
    promise = promise.then(function (result) {

      //in case the batch was empty, there is nothing to unpack (should no longer be hit)
      if (result.total_operations == 0) {
        return [];
      }

      return mailchimp._getAndUnpackBatchResults(result.response_body_url, opts)
    })
  }

  //If a callback is used, resolve it and don't return the promise
  if (done) {
    promise
      .then(function (result) {
        done(null, result)
      })
      .catch(function (err) {
        done(err);
      })
    return null;
  }

  return promise
}

Mailchimp.prototype.batch = function (operations, done, opts) {
  var mailchimp = this;

  //If done is not a function, and no opts are given, second argument is the opts
  if (!opts && !_.isFunction(done)) {
    opts = done;
    done = null;
  }

  opts = _.clone(opts) || {};


  //TODO: Validate arguments and reject errors

  //If the batch call does not get an operation, but a single normal call, return the result instead of a length 1 array
  //This is useful for large get requests, like all subscribers of a list without paging
  var should_unarray = false;
  if (!_.isArray(operations)) {
    operations = [operations]
    should_unarray = true;
  }

  //default wait to true
  if (opts.wait !== false) {
    opts.wait = true;
  }

  //default unpack to true
  if (opts.unpack !== false) {
    opts.unpack = true;
  }

  //default verbose to true
  if (opts.verbose !== false) {
    opts.verbose = true;
  }


  //handle special case of empty batch with unpack.
  //empty batches without unpack are still sent to mailchimp to get consistent responses from mailchimp
  if (operations.length == 0 && opts.wait && opts.unpack) {
    return Promise.resolve([]);
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


    if (_operation.method) {
      _operation.method = _operation.method.toUpperCase();
    }

    if (_operation.query) {
      _operation.params = _.assign({},_operation.query, _operation.params);
      delete _operation.query
    }

    _operations.push(_operation);
    id++;
  })

  var promise = mailchimp.request({
    method : 'post',
    path : '/batches',
    body : {
      operations : _operations  
    }
  })


  if (opts.verbose) {
    promise = promise.then(function (result) {
      console.log('Batch started with id:', result.id);
      return result
    })
  }

  if (opts.wait) {
    promise = promise.then(function (result) {
      return mailchimp.batchWait(result.id, opts)
    })
  }

  if (opts.wait && opts.unpack && should_unarray) {
    promise = promise.then(function (result) {
      if (result.length == 1) {
        result = result[0];
      }
      return result
    })
  }


  //If a callback is used, resolve it and don't return the promise
  if (done) {
    promise
      .then(function (result) {
        done(null, result)
      })
      .catch(function (err) {
        done(err);
      })
    return null;
  }

  return promise

  

}

Mailchimp.prototype.request = function (options, done) {
  var mailchimp = this;
  var promise = new Promise(function(resolve, reject) {
    if (!options) {
      reject(new Error("No request options given"));
      return;
    }

    var path = formatPath(options.path, options.path_params);
    var method = options.method || 'get';
    var body = options.body || {};
    var params = options.params;
    var query = options.query;

    //Parems used to refer to query parameters, because of the mailchimp documentation.
    if (params) {
      if (!query) {
        query = params;
      }
    }

    if (!path || !_.isString(path)) {
      reject(new Error('No path given'))
      return;
    }

    request({
      method : method,
      url : mailchimp.__base_url + path,
      auth : {
        user : 'any',
        password : mailchimp.__api_key
      },
      json : body,
      qs : query,
      headers : {
        'User-Agent' : 'mailchimp-api-v3 : https://github.com/thorning/node-mailchimp'
      }
    }, function (err, response) {

      if (err) {
        reject(new Error(err))
        return;
      }

      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(Object.assign(new Error(response.body.detail), response.body));
        return;
      }

      var result = response.body || {};
      result.statusCode = response.statusCode;

      resolve(result)
    })

  })

  //If a callback is used, resolve it and don't return the promise
  if (done) {
    promise
      .then(function (result) {
        done(null, result)
      })
      .catch(function (err) {
        done(err);
      })
    return null;
  }

  return promise
}


module.exports = exports = Mailchimp;
