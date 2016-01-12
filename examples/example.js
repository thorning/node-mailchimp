var Mailchimp = require('../index.js');

var api_key = '...'
var example_list_id = '...';

var mailchimp = new Mailchimp(api_key);

var callback = function (err, result) {
  if (err) {
    console.log('error', err);
  }
  console.log(result);
  process.exit(0);
}

var status = {
  method : 'get',
  path : '/',
}

var get_lists = {
  method : 'get',
  path : '/lists',
}

var get_list_info = {
  method : 'get',
  path : '/lists/' + example_list_id
}

var get_list_info_path_params = {
  method : 'get',
  path : 'lists/{list_id}',
  path_params : {
    list_id : example_list_id
  }
}

// mailchimp.request(status, callback)
// mailchimp.request(get_lists, callback)
// mailchimp.request(get_list_info, callback)
mailchimp.request(get_list_info_path_params, callback)
