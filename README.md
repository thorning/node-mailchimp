# node-mailchimp

Mailchimp api wrapper for v3 of the mailchimp api, with batch handling

```javascript
var Mailchimp = require('mailchimp-api-v3')

var mailchimp = new Mailchimp(api_key);

mailchimp.get({
  path : '/lists/id1'
}, function (err, result) {
  ...
})
```

seemless batch calls, with polling and unpacking of results

```javascript
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
```

## Installation

`$ npm install mailchimp-api-v3`

## Usage

For information on the possible calls, reffer to the mailchimp api v3 documentation: [http://developer.mailchimp.com/documentation/mailchimp/reference/overview/](http://developer.mailchimp.com/documentation/mailchimp/reference/overview/)

### Initialization

```javascript
var Mailchimp = require('mailchimp-api-v3')

var mailchimp = new Mailchimp(api_key);
```

### Standard Calls

```javascript
mailchimp.request({
  method : 'get|post|put|patch|delete',
  path : 'path for the call, see mailchimp documentation for possible calls'
  path_params : {
    //path parameters, see mailchimp documentation for each call
  }
  body : {
    //body parameters, see mailchimp documentation for each call
  },
  params : {
    //query string parameters, see mailchimp documentation for each call
  }
}, callback)
```

`path` can be given either exactly as in the mailchimp documentaton (`"/campaigns/{campaign_id}"`) and `path_params` specifying id values, or as a string with path parameters already substituded, and no `path_params`

For each request method, convinience calls exists to default to that method:
```javascript
mailchimp.get({}, cb)
mailchimp.post({}, cb)
mailchimp.put({}, cb)
mailchimp.patch({}, cb)
mailchimp.delete({}, cb)
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
}, cb)
```

`batch` takes an array of call options, exactly as used in the standard call.

* `wait` whether or not to wait for the batch command to finish, defaults to `true`
* `interval` if `wait` is true, the interval to poll for the status of the batch call, defaults to 2000ms
* `unpack` if `wait` is true, whether or not to get and unpack the results of the batch operation, and return the responsebodies.