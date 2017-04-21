# node-mailchimp

Mailchimp api wrapper for v3 of the mailchimp api, with batch handling. Supports both promise and callback handling.

```javascript
var Mailchimp = require('mailchimp-api-v3')

var mailchimp = new Mailchimp(api_key);

//Callback style
mailchimp.get({
  path : '/lists/id1'
}, function (err, result) {
  ...
})

//Promise style
mailchimp.get({
  path : '/lists/id1'
})
.then(function (result) {
  ...
})
.catch(function (err) {
  ...
})
```

seamless batch calls, with polling and unpacking of results

```javascript
//Callback style
mailchimp.batch([
{
  method : 'get',
  path : '/lists/id1'
},
{
  method : 'get',
  path : '/lists/id2'
}], function (err, results) {
  //results[0] same as result in previous example
})

//Promise style
mailchimp.batch([
{
  method : 'get',
  path : '/lists/id1'
},
{
  method : 'get',
  path : '/lists/id2'
}])
.then(function (results) {
  //results[0] same as result in previous example
})
.catch(function (err) {
  ...
})
```

## Why
Version 3 of the mailchimp api is an excellent RESTful api. This library makes it easy to integrate mailchimp using their own api documentation.

This library also supports easy usage of the mailchimp batch operations, enabling them to be used just as the standard api calls.

## Installation

`$ npm install mailchimp-api-v3`

## Usage

For information on the possible calls, refer to the mailchimp api v3 documentation: [http://developer.mailchimp.com/documentation/mailchimp/reference/overview/](http://developer.mailchimp.com/documentation/mailchimp/reference/overview/)

### Promise support

In all calls you can omit the callback, and a promise will be returned instead.

### Initialization

```javascript
var Mailchimp = require('mailchimp-api-v3')

var mailchimp = new Mailchimp(api_key);
```

### Standard Calls

```javascript
mailchimp.request({
  method : 'get|post|put|patch|delete',
  path : 'path for the call, see mailchimp documentation for possible calls',
  path_params : {
    //path parameters, see mailchimp documentation for each call
  },
  body : {
    //body parameters, see mailchimp documentation for each call
  },
  query : {
    //query string parameters, see mailchimp documentation for each call
  }
}, callback)
```

`path` can be given either exactly as in the mailchimp documentation (`"/campaigns/{campaign_id}"`) and `path_params` specifying id values, or as a string with path parameters already substituted, and no `path_params`

For each request method, convenience calls exists to make common calls:

```javascript
mailchimp.get(path, [query], [callback])
mailchimp.post(path, [body], [callback])
mailchimp.put(path, [body], [callback])
mailchimp.patch(path, [body], [callback])
mailchimp.delete(path, [callback])
```

This allows shorthand forms like:

```javascript
mailchimp.get('/lists')
.then(function(results) {
  ...
})
.catch(function (err) {
  ...
})

mailchimp.post('/lists/id/members', {
  email_address : '...',
  status : 'subscribed'
  ...
})
.then(function(results) {
  ...
})
.catch(function (err) {
  ...
})
```

### Batch Calls

```javascript
var calls = [
{
  method : 'post',
  path : '/lists/id1/members'
  body : {
    email_address : '1@example.com',
    status : 'subscribed'
  }
},
{
  method : 'post',
  path : '/lists/id1/members'
  body : {
    email_address : '2@example.com',
    status : 'subscribed'
  }
}]


mailchimp.batch(calls, callback, {
  wait : true,
  interval : 2000,
  unpack : true,
})
```

`batch` takes an array of call options, exactly as used in the standard call.

* `wait` whether or not to wait for the batch command to finish, defaults to `true`
* `interval` if `wait` is true, the interval to poll for the status of the batch call, defaults to 2000ms
* `unpack` if `wait` is true, whether or not to get and unpack the results of the batch operation, and return the response bodies.
* `verbose` if `wait` is true, whether or not to log progress to the console

#### BatchWait

```javascript
mailchimp.batchWait(batch_id, callback, {
  interval : 2000,
  unpack : true,
})
```

If you call `batch` with `wait : false`, you can use the returned batch id to resume pooling and unpacking the results at a later time.
This also allows you to "reconnect" to a batch operation after a crash or similar.

#### Single operation batch

If you pass a single operation, instead of an array to `batch`, the result will be the same as if you ran the operation without batch.
This is very useful if you want to make calls without paging, where a normal call would take to long, and likely time out.

```javascript
mailchimp.batch({
  method : 'get',
  path : '/lists/id/members',
  query : {
    count  : 10000000000,
  }
}, function (err, result) {
  //result is the same as a normal .get request
})
```
